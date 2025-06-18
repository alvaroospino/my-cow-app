// src/containers/CowDetailContainer.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useCowData from '../hooks/useCowData';
// [CAMBIO PARA INDEXEDDB] Importamos getImage de IndexedDB
import { getImage, deleteImage } from '../utils/indexedDb';
import placeholderCow from '../assets/placeholder-cow.png';
import Modal from '../components/Modal';
import '../styles/CowDetail.css';

const CowDetailContainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCowById, isLoading, deleteCow } = useCowData();

  const [cow, setCow] = useState(null);
  // [CAMBIO PARA INDEXEDDB] Estado para la URL de la imagen de detalle
  const [detailImageUrl, setDetailImageUrl] = useState(placeholderCow);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let currentObjectUrl = null; // Para limpiar la URL anterior

    const fetchCowAndImage = async () => {
      if (!isLoading && id) {
        const foundCow = getCowById(id);
        if (foundCow) {
          setCow(foundCow);

          // [CAMBIO PARA INDEXEDDB] Intentar cargar la imagen de IndexedDB
          if (foundCow.photo) { // Asumimos que foundCow.photo ahora es un ID o un indicador
            try {
              const imageBlob = await getImage(id);
              if (imageBlob) {
                currentObjectUrl = URL.createObjectURL(imageBlob);
                setDetailImageUrl(currentObjectUrl);
              } else {
                setDetailImageUrl(placeholderCow); // Si no hay blob, usar placeholder
              }
            } catch (error) {
              console.error("Error loading image for detail from IndexedDB:", error);
              setDetailImageUrl(placeholderCow); // Fallback en caso de error
            }
          } else {
            setDetailImageUrl(placeholderCow); // Si cow.photo es vacío, usar placeholder
          }
        } else {
          console.warn(`Vaca con ID ${id} no encontrada en detalles.`);
          alert('Vaca no encontrada. Redirigiendo a la lista.');
          navigate('/vacas');
        }
      }
    };

    fetchCowAndImage();

    // [CAMBIO PARA INDEXEDDB] Función de limpieza para revocar Object URLs
    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [id, isLoading, getCowById, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleEdit = () => {
    navigate(`/vacas/editar/${cow.id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => { // Marcar como async
    if (cow) {
      const success = deleteCow(cow.id); // Esta función debería actualizar el estado en useCowData
      if (success) {
        // [CAMBIO PARA INDEXEDDB] También elimina la imagen de IndexedDB
        try {
          await deleteImage(cow.id);
          console.log(`Imagen de la vaca ${cow.id} eliminada de IndexedDB tras eliminar la vaca.`);
        } catch (error) {
          console.error("Error al eliminar imagen de IndexedDB durante eliminación de vaca:", error);
        }

        alert(`Vaca "${cow.name}" eliminada con éxito.`);
        navigate('/vacas');
      } else {
        alert('Error al eliminar la vaca.');
      }
    }
    setShowDeleteModal(false);
  };


  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (isLoading || cow === null) {
    return (
      <div className="container">
        <p>Cargando detalles de la vaca...</p>
      </div>
    );
  }

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
          {/* [CAMBIO PARA INDEXEDDB] Usamos detailImageUrl */}
          <img src={detailImageUrl} alt={`Foto de ${cow.name}`} />
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