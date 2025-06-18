// src/components/AuthGuard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      navigate('/login'); // Redirige al login si no está logueado
    } else {
      setIsLoading(false); // Permite el renderizado de los hijos
    }
  }, [navigate]);

  // Muestra un mensaje de carga mientras se verifica el estado de login
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Cargando...
      </div>
    );
  }

  return children; // Si está logueado, renderiza los componentes hijos
};

export default AuthGuard;