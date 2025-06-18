// src/containers/CowFormContainer.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CowForm from '../components/CowForm';
import useAlert from '../hooks/useAlert';
import useCowData from '../hooks/useCowData'; // Nuestro custom hook

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
        showAlert(`Vaca con ID ${id} no encontrada. Redirigiendo...`, 'error', 3000); // <-- Cambiado a 'error' y duración
        setTimeout(() => { // <-- Retrasa la navegación
          navigate('/vacas');
        }, 3000); // Retrasa 3 segundos para que la alerta sea visible
      }
    } else if (!id && !isLoading) {
      setInitialCowData({});
    }
  }, [id, isLoading, getCowById, navigate, showAlert]); // Añade showAlert a las dependencias

  const handleSubmit = (formData) => {
    if (id) {
      updateCow({ ...formData, id });
      showAlert('Vaca actualizada con éxito 🥳', 'success', 3000); // <-- Cambiado a 'success' y duración
    } else {
      addCow(formData);
      showAlert('Vaca Registrada con éxito 🥳', 'success', 3000); // <-- Cambiado a 'success' y duración
    }

    // === CAMBIO CLAVE AQUÍ ===
    // Retrasa la navegación para que la alerta tenga tiempo de mostrarse
    setTimeout(() => {
      navigate('/vacas');
    }, 3000); // Navega después de 3 segundos (ajusta este tiempo según la duración de tu alerta)
    // ========================
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
      <AlertComponent /> {/* Asegúrate de que AlertComponent esté aquí */}
    </div>
  );
};

export default CowFormContainer;