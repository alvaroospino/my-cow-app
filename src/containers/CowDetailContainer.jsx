import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCowData from '../hooks/useCowData'; // Nuestro custom hook
import placeholderCow from '../assets/placeholder-cow.png'; // Para cuando no hay foto
import Modal from '../components/Modal';
import '../styles/CowDetail.css'; // Estilos específicos para el detalle

const CowDetailContainer = () => {
  const { id } = useParams(); // Obtiene el ID de la vaca desde la URL
  const navigate = useNavigate();
  // Obtiene getCowById, isLoading, deleteCow Y AHORA getImageFromDb
  const { getCowById, isLoading, deleteCow, getImageFromDb } = useCowData(); 

  const [cow, setCow] = useState(null); // Estado para almacenar la vaca a mostrar
  const [detailImageUrl, setDetailImageUrl] = useState(placeholderCow); // Estado para la URL de la imagen de detalle
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Estado para el modal de eliminación

  // Efecto para cargar los datos de la vaca
  useEffect(() => {
    if (!isLoading && id) {
      const foundCow = getCowById(id);
      if (foundCow) {
        setCow(foundCow);
      } else {
        console.warn(`Vaca con ID ${id} no encontrada en detalles.`);
        alert('Vaca no encontrada. Redirigiendo a la lista.');
        navigate('/vacas');
      }
    }
  }, [id, isLoading, getCowById, navigate]);

  // Nuevo efecto para cargar la imagen desde IndexedDB
  useEffect(() => {
    let currentObjectUrl = null; // Variable para almacenar el Object URL

    const loadImage = async () => {
      if (cow && cow.id) { // Solo si tenemos un objeto 'cow' y tiene un ID
        try {
          const imageBlob = await getImageFromDb(cow.id); // Obtiene el Blob de IndexedDB
          if (imageBlob) {
            currentObjectUrl = URL.createObjectURL(imageBlob);
            setDetailImageUrl(currentObjectUrl);
          } else {
            setDetailImageUrl(placeholderCow); // Si no hay imagen, usa el placeholder
          }
        } catch (error) {
          console.error(`Error loading detail image for cow ${cow.id} from IndexedDB:`, error);
          setDetailImageUrl(placeholderCow); // Fallback al placeholder en caso de error
        }
      } else {
        setDetailImageUrl(placeholderCow); // Si no hay vaca o ID, usa placeholder
      }
    };

    // Llama a la función de carga de imagen solo cuando 'cow' está disponible
    if (cow) { 
      loadImage();
    }

    // Función de limpieza para revocar el Object URL
    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [cow, getImageFromDb]); // Dependencias: recargar si 'cow' o 'getImageFromDb' cambian

  // Funciones para manejar la edición y eliminación
  const handleEdit = () => {
    navigate(`/vacas/editar/${cow.id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (cow) {
      deleteCow(cow.id);
      setShowDeleteModal(false);
      alert('Vaca eliminada con éxito.');
      navigate('/vacas'); // Redirige a la lista después de eliminar
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Muestra mensaje de carga si los datos aún no están listos
  if (isLoading || !cow) {
    return (
      <div className="container cow-detail-container">
        <p>Cargando detalles de la vaca...</p>
      </div>
    );
  }

  return (
    <div className="container cow-detail-container">
      <h2>Detalles de la Vaca: {cow.name}</h2>
      <div className="detail-card">
        <div className="detail-photo">
          {/* Usa la URL de la imagen cargada asíncronamente */}
          <img src={detailImageUrl} alt={`Foto de ${cow.name}`} /> 
        </div>
        <div className="detail-info">
          <p><strong>Nombre:</strong> {cow.name}</p>
          <p>
            <strong>Tipo de Ganado:</strong>{' '}
            <span className={`cow-type-${cow.type || 'vaca'}`}>
              {cow.type ? cow.type.charAt(0).toUpperCase() + cow.type.slice(1) : 'Vaca'}
            </span>
          </p>
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