// src/containers/CowFormContainer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CowForm from '../components/CowForm';
import useAlert from '../hooks/useAlert';
import useCowData from '../hooks/useCowData';
// [CAMBIO PARA INDEXEDDB] Importamos las funciones de IndexedDB
import { saveImage, deleteImage } from '../utils/indexedDb';

const CowFormContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showAlert, AlertComponent } = useAlert();

  const { cows, isLoading, addCow, getCowById, updateCow } = useCowData();

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

  // [CAMBIO PARA INDEXEDDB] Modificamos handleSubmit para manejar el archivo de imagen
  const handleSubmit = async (formDataWithImage) => { // Ahora recibe el formData incluyendo imageFile
    const { imageFile, ...cowData } = formDataWithImage; // Separamos el archivo de imagen del resto de los datos de la vaca

    let savedCow; // Para guardar la vaca que se acaba de añadir/actualizar
    let cowIdToUse; // El ID que usaremos para IndexedDB

    if (id) {
      // Edición
      savedCow = updateCow({ ...cowData, id });
      cowIdToUse = id;
      showAlert('Vaca actualizada con éxito 🥳', 'success', 3000);
    } else {
      // Nueva vaca
      // [CAMBIO PARA INDEXEDDB] addCow ahora DEBE retornar el objeto de la vaca con su ID asignado
      savedCow = addCow(cowData); // addCow genera y asigna el ID
      cowIdToUse = savedCow?.id; // Usamos el ID devuelto por addCow
      showAlert('Vaca Registrada con éxito 🥳', 'success', 3000);
    }

    // [CAMBIO PARA INDEXEDDB] Manejo de la imagen después de guardar la vaca
    if (cowIdToUse) {
      if (imageFile) {
        // Si hay un archivo de imagen seleccionado, guárdalo en IndexedDB
        await saveImage(cowIdToUse, imageFile);
        console.log(`Imagen para vaca ${cowIdToUse} guardada en IndexedDB.`);
      } else if (!imageFile && cowData.photo === '') {
        // Si no hay archivo seleccionado y photo en formData es vacío (significa que la foto fue quitada)
        // Entonces eliminamos cualquier imagen existente para ese ID en IndexedDB
        await deleteImage(cowIdToUse);
        console.log(`Imagen para vaca ${cowIdToUse} eliminada de IndexedDB.`);
      }
      // Si !imageFile y cowData.photo NO es vacío, significa que no se cambió la imagen,
      // y la imagen original ya debería estar en IndexedDB (no hacemos nada).
    }


    setTimeout(() => {
      navigate('/vacas');
    }, 3000);
  };

  const handleCancel = () => {
    navigate('/vacas');
  };

  if (isLoading) {
    return (
      <div className="container">
        <p>Cargando datos de las vacas...</p>
      </div>
    );
  }

  // Si initialCowData es null y estamos en modo edición, significa que aún estamos esperando
  if (id && initialCowData === null) {
    return (
      <div className="container">
        <p>Preparando formulario de edición para la vaca...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>{id ? 'Editar Vaca' : 'Registrar Nueva Vaca'}</h2>
      <CowForm
        initialData={initialCowData || {}}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
      <AlertComponent />
    </div>
  );
};

export default CowFormContainer;