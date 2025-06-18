// src/components/CowCard.jsx
import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import placeholderCow from '../assets/placeholder-cow.png';
import '../styles/CowCard.css'; // Estilos específicos para la tarjeta

// [CAMBIO PARA INDEXEDDB] CowCard ahora recibe una prop 'getImageFromDb'
const CowCard = ({ cow, onView, onEdit, onDelete, getImageFromDb }) => {
  // Estado para la URL de la imagen de la tarjeta (inicialmente placeholder)
  const [cardImageUrl, setCardImageUrl] = useState(placeholderCow);

  useEffect(() => {
    let currentObjectUrl = null; // Para limpiar la URL anterior

    const loadImage = async () => {
      if (cow.id) { // Solo si la vaca tiene un ID
        try {
          const imageBlob = await getImageFromDb(cow.id); // Usa la función pasada por props
          if (imageBlob) {
            currentObjectUrl = URL.createObjectURL(imageBlob);
            setCardImageUrl(currentObjectUrl);
          } else {
            setCardImageUrl(placeholderCow); // Si no hay blob, usar placeholder
          }
        } catch (error) {
          console.error(`Error loading image for cow ${cow.id} from IndexedDB:`, error);
          setCardImageUrl(placeholderCow); // Fallback en caso de error
        }
      } else {
        setCardImageUrl(placeholderCow); // Si la vaca no tiene ID o foto, usar placeholder
      }
    };

    loadImage();

    // Función de limpieza para revocar Object URLs
    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [cow.id, getImageFromDb]); // Depende del ID de la vaca y de la función getImageFromDb

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="cow-card">
      <div className="cow-card-photo">
        {/* [CAMBIO PARA INDEXEDDB] Usamos cardImageUrl */}
        <img src={cardImageUrl} alt={`Foto de ${cow.name}`} />
      </div>
      <div className="cow-card-info">
        <h3>{cow.name}</h3>
        <p>
          Tipo: <span className={`cow-type-${cow.type || 'vaca'}`}>{cow.type ? cow.type.charAt(0).toUpperCase() + cow.type.slice(1) : 'Vaca'}</span>
        </p>
        <p>
          Propiedad:{' '}
          <span className={`ownership-${cow.ownershipType}`}>
            {cow.ownershipType === 'propiedad' ? 'Propiedad' : 'Partición'}
          </span>
        </p>
        <p className="card-date">Reg: {formatDate(cow.registrationDate)}</p>
      </div>
      <div className="cow-card-actions">
        <button onClick={() => onView(cow.id)} className="icon-btn view-btn" aria-label="Ver detalles">
          <FaEye />
        </button>
        <button onClick={() => onEdit(cow.id)} className="icon-btn edit-btn" aria-label="Editar vaca">
          <FaEdit />
        </button>
        <button onClick={() => onDelete(cow.id)} className="icon-btn delete-btn" aria-label="Eliminar vaca">
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default CowCard;