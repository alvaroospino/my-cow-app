// src/hooks/useAlert.jsx
import React, { useState, useCallback } from 'react';
import Alert from '../components/Alert'; // Asegúrate de que la ruta sea correcta

const useAlert = () => {
  const [alert, setAlert] = useState(null); // { message, type }

  const showAlert = useCallback((message, type = 'info', duration = 5000) => {
    setAlert({ message, type, duration });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  // Función para renderizar el componente Alert
  const AlertComponent = () => (
    alert ? <Alert {...alert} onClose={hideAlert} /> : null
  );

  return { showAlert, hideAlert, AlertComponent };
};

export default useAlert;