// src/App.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import DashboardContainer from './containers/DashboardContainer';
import CowListContainer from './containers/CowListContainer';
import CowFormContainer from './containers/CowFormContainer';
import CowDetailContainer from './containers/CowDetailContainer';
import FakeLogin from './components/FakeLogin';
import AuthGuard from './components/AuthGuard';
import { FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

import useAlert from './hooks/useAlert';

import './App.css';
import './styles/Navbar.css';

const AppContent = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isHeaderShrunk, setIsHeaderShrunk] = useState(false);
  const lastScrollY = useRef(0);

  const navigate = useNavigate();
  const { showAlert, AlertComponent } = useAlert();

  const handleLoginSuccess = () => {
    setIsUserLoggedIn(true);
    showAlert('¡Inicio de sesión exitoso!', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsUserLoggedIn(false);
    navigate('/login', { replace: true });
    showAlert('Has cerrado sesión.', 'info');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    if (currentScrollY === 0) {
      setIsHeaderShrunk(false);
    } else if (currentScrollY > 50 && currentScrollY > lastScrollY.current) {
      // Scrolling down past a threshold
      setIsHeaderShrunk(true);
    } else if (currentScrollY < lastScrollY.current) {
      // Scrolling up
      setIsHeaderShrunk(false);
    }

    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    const checkLoginStatus = () => {
      setIsUserLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    };
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <>
      <header className={`navbar ${isHeaderShrunk ? 'shrunk' : ''}`}>
        <nav className="navbar-nav">
          {/* Logo a la izquierda */}
          <Link to="/" className="nav-brand" onClick={closeSidebar}>
            Inventario Ganadero
          </Link>

          {/* Botón de hamburguesa a la derecha (visible solo en móvil con CSS) */}
          <button className="hamburger-menu-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Menú de escritorio (oculto en móvil con CSS) */}
          <div className="nav-links-desktop">
            {isUserLoggedIn ? (
              <>
                <Link to="/" className="nav-item">Dashboard</Link>
                <Link to="/vacas" className="nav-item">Ver Ganado</Link>
                <Link to="/vacas/nueva" className="nav-item">Registrar Ganado</Link>
                <span className="user-info">Usuario (Alvaro)</span>
                <button onClick={handleLogout} className="nav-item logout-btn">
                  <FaSignOutAlt /> Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="nav-item">Iniciar Sesión</Link>
            )}
          </div>
        </nav>
      </header>

      {/* --- SIDEBAR MENÚ LATERAL --- */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={closeSidebar}>
          <FaTimes />
        </button>
        <div className="sidebar-content">
          {isUserLoggedIn ? (
            <>
              <Link to="/" className="sidebar-item" onClick={closeSidebar}>Dashboard</Link>
              <Link to="/vacas" className="sidebar-item" onClick={closeSidebar}>Ver Ganado</Link>
              <Link to="/vacas/nueva" className="sidebar-item" onClick={closeSidebar}>Registrar Ganado</Link>
              <span className="sidebar-user-info">Usuario (Alvaro)</span>
              <button onClick={() => { handleLogout(); closeSidebar(); }} className="sidebar-item sidebar-logout-btn">
                <FaSignOutAlt /> Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="sidebar-item" onClick={closeSidebar}>Iniciar Sesión</Link>
          )}
        </div>
      </div>
      {/* Overlay para cerrar el sidebar al hacer clic fuera */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
      {/* ------------------------------------- */}

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<FakeLogin onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/" element={<AuthGuard><DashboardContainer /></AuthGuard>} />
          <Route path="/vacas" element={<AuthGuard><CowListContainer /></AuthGuard>} />
          <Route path="/vacas/nueva" element={<AuthGuard><CowFormContainer /></AuthGuard>} />
          <Route path="/vacas/editar/:id" element={<AuthGuard><CowFormContainer /></AuthGuard>} />
          <Route path="/vacas/:id" element={<AuthGuard><CowDetailContainer /></AuthGuard>} />
          <Route path="*" element={<AuthGuard><DashboardContainer /></AuthGuard>} />
        </Routes>
      </main>
      <AlertComponent />
    </>
  );
};

function App() {
  // === CONFIGURACIÓN PARA GITHUB PAGES Y VITE ===
  // import.meta.env.BASE_URL obtiene el valor de 'base' de vite.config.js
  // Para tu repositorio 'my-cow-app', esto será '/my-cow-app/'
  const basename = import.meta.env.BASE_URL;

  return (
    // Pasa la prop basename al Router
    <Router basename={basename}>
      <AppContent />
    </Router>
  );
}

export default App;