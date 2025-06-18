// src/components/FakeLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAlert from '../hooks/useAlert'; //
import '../styles/FakeLogin.css';

// Acepta una nueva prop: onLoginSuccess
const FakeLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
   const { showAlert, AlertComponent } = useAlert(); // <--- USA EL HOOK DE ALERTA
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    

    const predefinedUsername = 'alvarito12';
    const predefinedPassword = '013126';

    if (username === predefinedUsername && password === predefinedPassword) {
      localStorage.setItem('isLoggedIn', 'true');
      if (onLoginSuccess) {
        onLoginSuccess(); // <--- Llama a la función de callback
      }
      navigate('/', { replace: true }); // Navega al dashboard
    } else {
       showAlert('Usuario o contraseña incorrectos.', 'error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <p>Ingresa tus credenciales:</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="User"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
       
          <button type="submit" className="btn primary login-btn">
            Iniciar Sesión
          </button>
        </form>
      </div>
       <AlertComponent />
    </div>
  );
};

export default FakeLogin;