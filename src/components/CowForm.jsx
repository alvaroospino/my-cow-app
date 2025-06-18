// src/components/CowForm.jsx
import React, { useState, useEffect } from 'react';
// Importamos un CSS simple para el formulario
import '../styles/CowForm.css';
// Importamos la imagen de placeholder para cuando no haya foto
import placeholderCow from '../assets/placeholder-cow.png';

const CowForm = ({ initialData = {}, onSubmit, onCancel }) => {
  // Estado local para los datos del formulario
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    photo: initialData.photo || '', // Base64 de la imagen o URL (null se cambia a '' para consistencia)
    ownershipType: initialData.ownershipType || 'propiedad', // Valor por defecto
    observations: initialData.observations || '',
    registrationDate: initialData.registrationDate || new Date().toISOString().slice(0, 10), // Fecha actual en formato YYYY-MM-DD
    type: initialData.type || 'vaca' // <--- NUEVO CAMPO: Tipo de Ganado con valor por defecto
  });

  // Estado para la vista previa de la foto
  const [photoPreview, setPhotoPreview] = useState(initialData.photo || placeholderCow);

  // Efecto para actualizar el formulario y la vista previa si initialData cambia (útil para edición)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        photo: initialData.photo || '',
        ownershipType: initialData.ownershipType || 'propiedad',
        observations: initialData.observations || '',
        registrationDate: initialData.registrationDate || new Date().toISOString().slice(0, 10),
        type: initialData.type || 'vaca' // Asegura que el tipo se cargue o tenga un valor por defecto
      });
      setPhotoPreview(initialData.photo || placeholderCow);
    } else {
      // Reiniciar el formulario y la vista previa si no hay initialData (nuevo registro)
      setFormData({
        name: '',
        photo: '',
        ownershipType: 'propiedad',
        observations: '',
        registrationDate: new Date().toISOString().slice(0, 10),
        type: 'vaca'
      });
      setPhotoPreview(placeholderCow);
    }
  }, [initialData]);

  // Manejador de cambios en los inputs de texto y select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Manejador para el input de tipo 'file' (foto)
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Almacena la imagen como Base64
        setFormData((prevData) => ({
          ...prevData,
          photo: reader.result,
        }));
        setPhotoPreview(reader.result); // Actualiza la vista previa
      };
      reader.readAsDataURL(file); // Lee el archivo como una URL de datos (Base64)
    } else {
      // Si no se selecciona ningún archivo o se cancela la selección
      setFormData((prevData) => ({
        ...prevData,
        photo: '', // Limpia la foto en el estado
      }));
      setPhotoPreview(placeholderCow); // Vuelve al placeholder
    }
  };

  // Manejador para eliminar la foto actual
  const handleClearPhoto = () => {
    setFormData((prevData) => ({
      ...prevData,
      photo: '',
    }));
    setPhotoPreview(placeholderCow);
    // Opcional: limpiar el input de tipo file si es necesario
    const photoInput = document.getElementById('photo-upload');
    if (photoInput) photoInput.value = '';
  };

  // Manejador para el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // Llama a la función onSubmit pasada por props
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
            accept="image/*" // Solo acepta archivos de imagen
            onChange={handlePhotoChange}
            style={{ display: 'none' }} // Oculta el input de archivo original
          />
        </label>
        {formData.photo && formData.photo !== placeholderCow && (
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
            required // Este campo también debe ser obligatorio
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