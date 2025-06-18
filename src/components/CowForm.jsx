// src/components/CowForm.jsx
import React, { useState, useEffect } from 'react';
// [CAMBIO PARA INDEXEDDB] Importamos las funciones de IndexedDB
import { getImage, deleteImage } from '../utils/indexedDb';
// Importamos un CSS simple para el formulario
import '../styles/CowForm.css';
// Importamos la imagen de placeholder para cuando no haya foto
import placeholderCow from '../assets/placeholder-cow.png';

const CowForm = ({ initialData = {}, onSubmit, onCancel }) => {
  // Estado local para los datos del formulario (photo ya NO es Base64, puede ser un ID o null)
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    // [CAMBIO PARA INDEXEDDB] 'photo' ahora puede almacenar un ID de imagen o ser vacío
    photo: initialData.photo || '',
    ownershipType: initialData.ownershipType || 'propiedad',
    observations: initialData.observations || '',
    registrationDate: initialData.registrationDate || new Date().toISOString().slice(0, 10),
    type: initialData.type || 'vaca'
  });

  // [CAMBIO PARA INDEXEDDB] Nuevo estado para el archivo de imagen seleccionado (File/Blob)
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  // Estado para la vista previa de la foto (ahora será una URL de objeto o Base64 del placeholder)
  const [photoPreview, setPhotoPreview] = useState(placeholderCow);

  // [CAMBIO PARA INDEXEDDB] Efecto para cargar la imagen de IndexedDB para edición y limpiar URLs
  useEffect(() => {
    let currentPhotoUrl = initialData.photo || placeholderCow; // photo podría ser una URL Base64 antigua o un ID

    // Si initialData.id existe (modo edición) y no hay un archivo seleccionado
    // intentamos cargar la imagen de IndexedDB
    const loadExistingImage = async () => {
      if (initialData.id) { // Solo si es una vaca existente
        try {
          const imageBlob = await getImage(initialData.id);
          if (imageBlob) {
            const url = URL.createObjectURL(imageBlob);
            setPhotoPreview(url);
            setSelectedImageFile(imageBlob); // Establecer el blob como el archivo actual
            currentPhotoUrl = url; // Actualizar la URL para limpieza
          } else {
            // Si no hay imagen en IndexedDB para este ID
            setPhotoPreview(initialData.photo || placeholderCow);
          }
        } catch (error) {
          console.error("Error loading image from IndexedDB:", error);
          setPhotoPreview(initialData.photo || placeholderCow); // Fallback a lo que haya
        }
      } else {
        // Para nuevo formulario, limpia todo
        setPhotoPreview(placeholderCow);
        setSelectedImageFile(null);
      }
    };

    setFormData({ // Actualiza formData con los datos iniciales
      name: initialData.name || '',
      photo: initialData.photo || '', // Mantener 'photo' como ID o vacío
      ownershipType: initialData.ownershipType || 'propiedad',
      observations: initialData.observations || '',
      registrationDate: initialData.registrationDate || new Date().toISOString().slice(0, 10),
      type: initialData.type || 'vaca'
    });

    loadExistingImage();

    // Función de limpieza para revocar Object URLs
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      // Si la URL se cambió durante la vida del componente, revoca la anterior también
      if (currentPhotoUrl && currentPhotoUrl.startsWith('blob:') && currentPhotoUrl !== photoPreview) {
          URL.revokeObjectURL(currentPhotoUrl);
      }
    };
  }, [initialData.id, initialData.photo, initialData.name, initialData.ownershipType, initialData.observations, initialData.registrationDate, initialData.type]); // Añadir todas las dependencias de initialData


  // Manejador de cambios en los inputs de texto y select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // [CAMBIO PARA INDEXEDDB] Manejador para el input de tipo 'file' (foto)
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file); // Almacena el archivo File directamente
      setPhotoPreview(URL.createObjectURL(file)); // Crea una URL de objeto para la vista previa
    } else {
      setSelectedImageFile(null);
      setPhotoPreview(placeholderCow);
    }
  };

  // [CAMBIO PARA INDEXEDDB] Manejador para eliminar la foto actual
  const handleClearPhoto = async () => {
    setFormData((prevData) => ({
      ...prevData,
      photo: '', // Indica que no hay imagen asociada en el modelo de la vaca
    }));
    setSelectedImageFile(null); // Limpiar el archivo seleccionado
    setPhotoPreview(placeholderCow); // Volver al placeholder

    // Opcional: limpiar el input de tipo file si es necesario
    const photoInput = document.getElementById('photo-upload');
    if (photoInput) photoInput.value = '';

    // Si estamos editando una vaca y tenía una imagen, la eliminamos de IndexedDB
    if (initialData.id && initialData.photo) { // initialData.photo se usará para indicar que existía una imagen
      try {
        await deleteImage(initialData.id);
        console.log(`Imagen de la vaca ${initialData.id} eliminada de IndexedDB.`);
      } catch (error) {
        console.error("Error al eliminar imagen de IndexedDB:", error);
      }
    }
  };

  // Manejador para el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // [CAMBIO PARA INDEXEDDB] Pasamos formData y el archivo de imagen seleccionado
    onSubmit({ ...formData, imageFile: selectedImageFile });
  };

  return (
    <form className="cow-form" onSubmit={handleSubmit}>
      {/* Sección de la foto */}
      <div className="form-photo-upload">
        <img src={photoPreview} alt="Vista previa de la vaca" className="photo-preview-image" />
        <label htmlFor="photo-upload" className="btn secondary upload-btn">
          Subir Foto
          <input
            type="file"
            id="photo-upload"
            name="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </label>
        {/* [CAMBIO PARA INDEXEDDB] Condición para mostrar "Quitar Foto" */}
        {photoPreview !== placeholderCow && (
          <button
            type="button"
            className="btn danger clear-photo-btn"
            onClick={handleClearPhoto}
          >
            Quitar Foto
          </button>
        )}
      </div>

      <div className="form-grid">
        {/* Campo Nombre */}
        <div className="form-group">
          <label htmlFor="name">Nombre de la Vaca:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej. Margarita"
            required
          />
        </div>

        {/* Campo Tipo de Propiedad (Radio Buttons) */}
        <div className="form-group">
          <label>Tipo de Propiedad:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="ownershipType"
                value="propiedad"
                checked={formData.ownershipType === 'propiedad'}
                onChange={handleChange}
              />{' '}
              Propiedad
            </label>
            <label>
              <input
                type="radio"
                name="ownershipType"
                value="particion"
                checked={formData.ownershipType === 'particion'}
                onChange={handleChange}
              />{' '}
              Partición
            </label>
          </div>
        </div>

        {/* Campo Fecha de Registro */}
        <div className="form-group">
          <label htmlFor="registrationDate">Fecha de Registro:</label>
          <input
            type="date"
            id="registrationDate"
            name="registrationDate"
            value={formData.registrationDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Nuevo Campo: Tipo de Ganado (Select) */}
        <div className="form-group">
          <label htmlFor="type">Tipo de Ganado:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="vaca">Vaca</option>
            <option value="ternero">Ternero</option>
            <option value="novilla">Novilla</option>
            <option value="toro">Toro</option>
          </select>
        </div>

        {/* Campo Observaciones Adicionales (Textarea) */}
        <div className="form-group full-width">
          <label htmlFor="observations">Observaciones Adicionales:</label>
          <textarea
            id="observations"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            rows="4"
            placeholder="Añade cualquier observación relevante sobre el ganado..."
          ></textarea>
        </div>
      </div> {/* Fin form-grid */}

      <div className="form-actions">
        <button type="submit" className="btn primary">
          Guardar Ganado
        </button>
        <button type="button" className="btn secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default CowForm;