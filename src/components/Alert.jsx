// src/components/Alert.jsx
import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import '../styles/Alert.css'; // Crearemos este CSS
import logo from '../assets/placeholder-cow.png'; // Asegúrate de tener tu logo aquí, si no, usa una ruta placeholder

const Alert = ({ message, type = 'info', onClose, duration = 5000 }) => {
  // `type` puede ser: 'success', 'error', 'warning', 'info'

  // Icono basado en el tipo de alerta
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="alert-icon success" />;
      case 'error':
        return <FaTimesCircle className="alert-icon error" />;
      case 'warning':
        return <FaExclamationCircle className="alert-icon warning" />;
      case 'info':
      default:
        return <FaInfoCircle className="alert-icon info" />;
    }
  };

  // Cierra la alerta automáticamente después de `duration` milisegundos
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta o la duración cambia
    }
  }, [onClose, duration]);

  return (
    <div className={`alert-overlay`}>
      <div className={`alert-box alert-${type}`}>
        <div className="alert-header">
          {logo && <img src={logo} alt="Logo de la Aplicación" className="alert-logo" />}
          <h3>Mensaje del Sistema</h3>
          <button className="alert-close-btn" onClick={onClose}>
            &times; {/* Símbolo de "x" */}
          </button>
        </div>
        <div className="alert-content">
          {getIcon()}
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;