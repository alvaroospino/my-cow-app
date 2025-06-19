// src/components/CowForm.jsx
import React, { useState, useEffect } from 'react';
import '../styles/CowForm.css';
import placeholderCow from '../assets/placeholder-cow.png';
import heic2any from 'heic2any'; // <--- ¡Ahora importamos heic2any!

// CowForm ahora acepta getImageFromDb como una prop para la carga inicial de fotos
const CowForm = ({ initialData = {}, onSubmit, onCancel, getImageFromDb }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    photo: null, // photo ahora almacenará el Blob/File real
    ownershipType: initialData.ownershipType || 'propiedad',
    observations: initialData.observations || '',
    registrationDate: initialData.registrationDate || new Date().toISOString().slice(0, 10),
    type: initialData.type || 'vaca'
  });

  const [selectedImageFile, setSelectedImageFile] = useState(null); // Almacena el objeto File/Blob real para el envío
  const [photoPreview, setPhotoPreview] = useState(placeholderCow); // Almacena la URL para la visualización de la vista previa

  // Efecto para cargar la foto inicial en modo edición
  useEffect(() => {
    let currentPreviewUrl = null;

    const loadInitialPhoto = async () => {
      // Si estamos editando una vaca existente (tiene un ID) y tiene una foto asociada (initialData.photo no vacío)
      // y tenemos la función getImageFromDb para buscarla.
      if (initialData.id && initialData.photo && getImageFromDb) {
        try {
          const imageBlob = await getImageFromDb(initialData.id); // Busca el Blob real
          if (imageBlob) {
            currentPreviewUrl = URL.createObjectURL(imageBlob);
            setPhotoPreview(currentPreviewUrl);
            setSelectedImageFile(imageBlob); // Establece el Blob como el archivo seleccionado
            setFormData(prevData => ({ ...prevData, photo: imageBlob })); // También actualiza formData.photo con el Blob
          } else {
            setPhotoPreview(placeholderCow);
            setSelectedImageFile(null);
            setFormData(prevData => ({ ...prevData, photo: null }));
          }
        } catch (error) {
          console.error("Error al cargar la imagen inicial desde IndexedDB para CowForm:", error);
          setPhotoPreview(placeholderCow);
          setSelectedImageFile(null);
          setFormData(prevData => ({ ...prevData, photo: null }));
        }
      } else {
        // Para vacas nuevas o existentes sin foto, o si getImageFromDb no se proporciona
        setPhotoPreview(placeholderCow);
        setSelectedImageFile(null);
        setFormData(prevData => ({ ...prevData, photo: null }));
      }
    };

    // Actualiza otros campos del formulario cuando initialData cambia
    setFormData(prevData => ({
        ...prevData,
        name: initialData.name || '',
        ownershipType: initialData.ownershipType || 'propiedad',
        observations: initialData.observations || '',
        registrationDate: initialData.registrationDate || new Date().toISOString().slice(0, 10),
        type: initialData.type || 'vaca'
    }));

    loadInitialPhoto(); // Llama a la función de carga

    // Función de limpieza para revocar la URL del objeto Blob
    return () => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl);
      }
    };
  }, [initialData, getImageFromDb]); // Depende de initialData y getImageFromDb

  // <--- ¡Lógica actualizada para manejar la carga de fotos con heic2any! --->
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedImageFile(null);
      setPhotoPreview(placeholderCow);
      setFormData(prevData => ({ ...prevData, photo: null }));
      return;
    }

    // Revoca la URL de la vista previa anterior si existe
    if (photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }

    // Verifica si el archivo es HEIC/HEIF
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      try {
        console.log("Detectado archivo HEIC/HEIF, intentando convertir con heic2any...");
        // Usa heic2any para convertir el Blob HEIC a un Blob JPEG
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg", // Puedes cambiar a 'image/png' si lo prefieres
          quality: 0.9 // Calidad de compresión para JPEG (0.0 a 1.0)
        });

        // heic2any puede devolver un solo Blob o un array si el HEIC tenía múltiples imágenes.
        // Asumimos que es una sola imagen para este caso.
        const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;


        // Establece el Blob convertido y la URL de vista previa
        setSelectedImageFile(finalBlob);
        setPhotoPreview(URL.createObjectURL(finalBlob));
        setFormData(prevData => ({ ...prevData, photo: finalBlob })); // Guarda el Blob convertido en el estado del formulario
        console.log("Conversión HEIC a JPEG exitosa con heic2any.");

      } catch (error) {
        console.error("Error al convertir imagen HEIC con heic2any:", error);
        alert("No se pudo procesar la imagen HEIC. Por favor, intente con otro formato o una imagen JPG/PNG directamente.");
        setSelectedImageFile(null);
        setPhotoPreview(placeholderCow);
        setFormData(prevData => ({ ...prevData, photo: null }));
      }
    } else if (file.type.startsWith('image/')) {
      // Si no es HEIC pero es un tipo de imagen estándar (JPG, PNG, GIF, WebP)
      setSelectedImageFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setFormData(prevData => ({ ...prevData, photo: file })); // Guarda el archivo original en el estado del formulario
    } else {
      // Si el tipo de archivo no es soportado
      alert("Tipo de archivo no soportado. Por favor, suba una imagen (JPG, PNG, HEIC, etc.).");
      setSelectedImageFile(null);
      setPhotoPreview(placeholderCow);
      setFormData(prevData => ({ ...prevData, photo: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Se asegura de pasar selectedImageFile (el Blob, que ya fue convertido si era HEIC)
    onSubmit({ ...formData, photo: selectedImageFile });
  };

  return (
    <form className="cow-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        {/* Campo de la Foto */}
        <div className="form-group photo-upload-group">
          <label htmlFor="photo-upload" className="photo-label">
            <img src={photoPreview} alt="Vista previa de la foto" className="photo-preview" />
            <div className="upload-overlay">
              <span>Seleccionar Foto</span>
            </div>
          </label>
          <input
            type="file"
            id="photo-upload"
            name="photo"
            // Aceptar cualquier tipo de imagen, la conversión HEIC la manejará
            accept="image/*" 
            onChange={handlePhotoChange}
            style={{ display: 'none' }}
          />
        </div>
        {/* Resto de los campos del formulario */}
        <div className="form-group">
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ownershipType">Tipo de Propiedad:</label>
          <select
            id="ownershipType"
            name="ownershipType"
            value={formData.ownershipType}
            onChange={handleChange}
            required
          >
            <option value="propiedad">Propiedad</option>
            <option value="particion">Partición</option>
          </select>
        </div>
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
      </div>
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