// src/containers/DashboardContainer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useCowData from '../hooks/useCowData';
// 1. Cambia 'FaCow' por 'FaPaw' o 'FaCube' o lo que prefieras
// 2. Verifica que los demás iconos que usas existen.
import { FaPlus, FaList, FaPaw, FaClipboardList, FaUsers } from 'react-icons/fa'; // <-- CAMBIADO FaCow por FaPaw
import '../styles/Dashboard.css';

const DashboardContainer = () => {
  const navigate = useNavigate();
  const { cows, isLoading } = useCowData();

  const totalCows = cows.length;
  const propiedadCows = cows.filter(cow => cow.ownershipType === 'propiedad').length;
  const particionCows = cows.filter(cow => cow.ownershipType === 'particion').length;

  const latestCows = [...cows]
    .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="dashboard-page container">
        <p>Cargando panel principal...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Mi Inventario de Vacas</h1>
        <p>Un vistazo rápido a tu rebaño.</p>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card total-cows">
          <FaPaw className="stat-icon" /> {/* <-- USANDO FaPaw */}
          <h3>Total de Vacas</h3>
          <p className="stat-value">{totalCows}</p>
        </div>
        <div className="stat-card owned-cows">
          <FaUsers className="stat-icon" />
          <h3>Vacas de Propiedad</h3>
          <p className="stat-value">{propiedadCows}</p>
        </div>
        <div className="stat-card share-cows">
          <FaClipboardList className="stat-icon" />
          <h3>Vacas de Partición</h3>
          <p className="stat-value">{particionCows}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="action-button primary" onClick={() => navigate('/vacas/nueva')}>
          <FaPlus />
          <span>Registrar Nueva Vaca</span>
        </button>
        <button className="action-button secondary" onClick={() => navigate('/vacas')}>
          <FaList />
          <span>Ver Todas las Vacas</span>
        </button>
      </div>

      <div className="dashboard-latest-cows">
        <h2>Últimas Vacas Añadidas</h2>
        {latestCows.length > 0 ? (
          <div className="latest-cows-list">
            {latestCows.map(cow => (
              <div key={cow.id} className="latest-cow-item" onClick={() => navigate(`/vacas/${cow.id}`)}>
                <img src={cow.photo || 'src/assets/placeholder-cow.png'} alt={cow.name} />
                <div className="item-info">
                  <h4>{cow.name}</h4>
                  <p className={`ownership-${cow.ownershipType}`}>
                    {cow.ownershipType === 'propiedad' ? 'Propiedad' : 'Partición'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-cows-message">Aún no hay vacas registradas.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardContainer;