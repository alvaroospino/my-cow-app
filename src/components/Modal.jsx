// src/components/Modal.jsx
import React from 'react';
import '../styles/Modal.css'; // Estilos para el modal

const Modal = ({ title, children, onClose, actions }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          {actions}
        </div>
      </div>
    </div>
  );
};

export default Modal;