// src/components/CowCard.jsx
import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import placeholderCow from '../assets/placeholder-cow.png';
import '../styles/CowCard.css'; // Estilos específicos para la tarjeta

const CowCard = ({ cow, onView, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="cow-card">
      <div className="cow-card-photo">
        <img src={cow.photo || placeholderCow} alt={`Foto de ${cow.name}`} />
      </div>
      <div className="cow-card-info">
        <h3>{cow.name}</h3>
        <p>
          Tipo: <span className={`cow-type-${cow.type || 'vaca'}`}>{cow.type ? cow.type.charAt(0).toUpperCase() + cow.type.slice(1) : 'Vaca'}</span> {/* <-- Muestra el tipo */}
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
