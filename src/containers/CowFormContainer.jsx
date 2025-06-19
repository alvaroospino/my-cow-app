// src/containers/CowFormContainer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CowForm from '../components/CowForm';
import useAlert from '../hooks/useAlert';
import useCowData from '../hooks/useCowData';
// Importamos las funciones de IndexedDB (ya las tenías aquí, lo mantengo)
import { saveImage, deleteImage } from '../utils/indexedDb'; 

const CowFormContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert, AlertComponent } = useAlert();

  // Asegúrate de desestructurar getImageFromDb aquí
  const { cows, isLoading, addCow, getCowById, updateCow, getImageFromDb } = useCowData();

  const [initialCowData, setInitialCowData] = useState(null);

  useEffect(() => {
    if (id && !isLoading) {
      const cow = getCowById(id);
      if (cow) {
        setInitialCowData(cow);
      } else {
        showAlert(`Vaca con ID ${id} no encontrada. Redirigiendo...`, 'error', 3000);
        setTimeout(() => {
          navigate('/vacas');
        }, 3000);
      }
    } else if (!id && !isLoading) {
      setInitialCowData({});
    }
  }, [id, isLoading, getCowById, navigate, showAlert]);

  // Modificamos handleSubmit para manejar el guardado de la foto en IndexedDB
  const handleSubmit = async (formData) => { // <-- Es importante que sea async
    const { photo: imageFile, ...cowData } = formData; // Extrae el archivo de imagen (Blob) del formData
    let cowIdToUse;

    if (id) {
      // Si estamos actualizando, actualizamos los datos de la vaca (sin la foto)
      updateCow({ ...cowData, id });
      cowIdToUse = id;
      showAlert('Vaca actualizada con éxito 🥳', 'success', 3000);
    } else {
      // Si estamos añadiendo, primero añadimos la vaca para obtener su ID
      const addedCow = addCow(cowData); // addCow ya no espera la foto en cowData.
      cowIdToUse = addedCow.id;
      showAlert('Vaca Registrada con éxito 🥳', 'success', 3000);
    }

    // Lógica de guardado/eliminación de la imagen en IndexedDB
    // imageFile ahora contendrá el Blob (ya convertido si era HEIC, o el original JPG/PNG)
    if (imageFile instanceof Blob) { // Asegúrate de que es un Blob
      await saveImage(cowIdToUse, imageFile); // Guarda la imagen con el ID de la vaca
      console.log(`Imagen para vaca ${cowIdToUse} guardada en IndexedDB.`);
    } else if (!imageFile && initialCowData && initialCowData.photo) {
      // Si NO hay nuevo imageFile y la vaca EXISTENTE tenía foto (initialCowData.photo es el ID de la foto)
      // esto implica que la foto fue eliminada del formulario
      await deleteImage(cowIdToUse);
      console.log(`Imagen para vaca ${cowIdToUse} eliminada de IndexedDB.`);
    }
    // Si !imageFile y initialCowData no tiene photo, significa que no había foto y no se añadió.
    // Si !imageFile y initialCowData tenía photo, pero no se tocó el input de archivo, entonces `imageFile` será null
    // y la foto original debe permanecer. En ese caso, no hacemos nada aquí.

    setTimeout(() => {
      navigate('/vacas');
    }, 3000);
  };

  const handleCancel = () => {
    navigate('/vacas');
  };

  if (isLoading || initialCowData === null) {
    return (
      <div className="container">
        <p>Cargando datos de las vacas...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>{id ? 'Editar Vaca' : 'Registrar Nueva Vaca'}</h2>
      <AlertComponent />
      <CowForm
        initialData={initialCowData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        getImageFromDb={getImageFromDb} 
      />
    </div>
  );
};

export default CowFormContainer;