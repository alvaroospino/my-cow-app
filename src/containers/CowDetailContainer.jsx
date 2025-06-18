// src/containers/CowDetailContainer.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCowData from '../hooks/useCowData'; // Nuestro custom hook
import placeholderCow from '../assets/placeholder-cow.png'; // Para cuando no hay foto
import Modal from '../components/Modal';
import '../styles/CowDetail.css'; // Estilos específicos para el detalle

const CowDetailContainer = () => {
  const { id } = useParams(); // Obtiene el ID de la vaca desde la URL
  const navigate = useNavigate();
  const { getCowById, isLoading, deleteCow } = useCowData(); // Obtenemos la función para buscar, el estado de carga y la función de eliminación

  const [cow, setCow] = useState(null); // Estado para almacenar la vaca a mostrar
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Estado para el modal de eliminación

  useEffect(() => {
    // Solo busca la vaca si no está cargando y si tenemos un ID
    if (!isLoading && id) {
      const foundCow = getCowById(id);
      if (foundCow) {
        setCow(foundCow);
      } else {
        // Si no se encuentra la vaca, redirige a la lista
        console.warn(`Vaca con ID ${id} no encontrada en detalles.`);
        alert('Vaca no encontrada. Redirigiendo a la lista.');
        navigate('/vacas');
      }
    }
  }, [id, isLoading, getCowById, navigate]); // Dependencias: id, estado de carga, y las funciones estables

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Manejadores para los botones de acción
  const handleEdit = () => {
    navigate(`/vacas/editar/${cow.id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (cow && deleteCow(cow.id)) {
      alert(`Vaca "${cow.name}" eliminada con éxito.`);
      navigate('/vacas'); // Redirige a la lista después de eliminar
    } else {
      alert('Error al eliminar la vaca.');
    }
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Muestra un mensaje de carga mientras se obtienen los datos
  if (isLoading || cow === null) { // Si aún está cargando o la vaca no ha sido encontrada/establecida
    return (
      <div className="container">
        <p>Cargando detalles de la vaca...</p>
      </div>
    );
  }

  // Si después de cargar, 'cow' sigue siendo null (significa que no se encontró)
  // Aunque el useEffect ya redirige, es una capa de seguridad.
  if (!cow) {
      return (
          <div className="container">
              <p>No se encontraron detalles para esta vaca.</p>
              <button className="btn primary" onClick={() => navigate('/vacas')}>Volver a la lista</button>
          </div>
      );
  }


  return (
    <div className="cow-detail-container">
      <div className="detail-header">
        <button className="btn secondary" onClick={() => navigate(-1)}>Volver</button>
        <h2>Detalles de {cow.name}</h2>
      </div>

      <div className="detail-content">
        <div className="detail-photo">
          <img src={cow.photo || placeholderCow} alt={`Foto de ${cow.name}`} />
        </div>
        <div className="detail-info">
          <p><strong>Nombre:</strong> {cow.name}</p>
          <p>
            <strong>Tipo de Propiedad:</strong>{' '}
            <span className={`ownership-${cow.ownershipType}`}>
              {cow.ownershipType === 'propiedad' ? 'Propiedad' : 'Partición'}
            </span>
          </p>
          <p><strong>Fecha de Registro:</strong> {formatDate(cow.registrationDate)}</p>
          <p><strong>Observaciones:</strong> {cow.observations || 'Ninguna observación adicional.'}</p>
        </div>
      </div>

      <div className="detail-actions">
        <button className="btn primary" onClick={handleEdit}>Editar</button>
        <button className="btn secondary" onClick={handleDeleteClick}>Eliminar</button>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <Modal
          title="Confirmar Eliminación"
          onClose={cancelDelete}
          actions={
            <>
              <button className="btn secondary" onClick={cancelDelete}>Cancelar</button>
              <button className="btn primary" onClick={confirmDelete}>Eliminar</button>
            </>
          }
        >
          <p>¿Estás seguro de que quieres eliminar a la vaca "{cow.name}"?</p>
          <p>¡Esta acción no se puede deshacer!</p>
        </Modal>
      )}
    </div>
  );
};

export default CowDetailContainer;