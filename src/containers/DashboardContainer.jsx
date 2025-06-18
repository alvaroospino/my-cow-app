import React, { useState, useEffect } from 'react'; // Asegúrate de importar useState y useEffect
import { useNavigate } from 'react-router-dom';
import useCowData from '../hooks/useCowData';
import placeholderCow from '../assets/placeholder-cow.png'; // <--- Importación CORRECTA del placeholder
import { FaPlus, FaList, FaPaw, FaClipboardList, FaUsers } from 'react-icons/fa';
import '../styles/Dashboard.css';

// Componente auxiliar para renderizar cada miniatura de vaca en el dashboard
// Esto encapsula la lógica asíncrona de carga de imagen de IndexedDB para cada ítem.
const DashboardCowThumbnail = ({ cow, getImageFromDb, navigate }) => {
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState(placeholderCow);

  useEffect(() => {
    let currentObjectUrl = null; // Variable para almacenar el Object URL

    const loadImage = async () => {
      if (cow.id) {
        try {
          const imageBlob = await getImageFromDb(cow.id); // Obtiene el Blob de IndexedDB
          if (imageBlob) {
            currentObjectUrl = URL.createObjectURL(imageBlob);
            setThumbnailImageUrl(currentObjectUrl);
          } else {
            setThumbnailImageUrl(placeholderCow); // Si no hay imagen, usa el placeholder
          }
        } catch (error) {
          console.error(`Error loading thumbnail image for cow ${cow.id} from IndexedDB:`, error);
          setThumbnailImageUrl(placeholderCow); // Fallback al placeholder en caso de error
        }
      } else {
        setThumbnailImageUrl(placeholderCow); // Si la vaca no tiene ID, usa placeholder
      }
    };

    loadImage();

    // Función de limpieza para revocar el Object URL cuando el componente se desmonte
    // o las dependencias cambien para evitar fugas de memoria.
    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [cow.id, getImageFromDb]); // Dependencias: recargar si el ID de la vaca o getImageFromDb cambian

  return (
    <div className="latest-cow-item" onClick={() => navigate(`/vacas/${cow.id}`)}>
      <img src={thumbnailImageUrl} alt={`Foto de ${cow.name}`} /> {/* <--- Usa la URL cargada */}
      <div className="item-info">
        <h4>{cow.name}</h4>
        <p className={`ownership-${cow.ownershipType}`}>
          {cow.ownershipType === 'propiedad' ? 'Propiedad' : 'Partición'}
        </p>
      </div>
    </div>
  );
};


const DashboardContainer = () => {
  const navigate = useNavigate();
  // Asegúrate de desestructurar 'getImageFromDb' desde useCowData
  const { cows, isLoading, getImageFromDb } = useCowData(); 

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
          <FaPaw className="stat-icon" />
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
              // Usa el nuevo componente DashboardCowThumbnail para cada vaca
              <DashboardCowThumbnail 
                key={cow.id} 
                cow={cow} 
                getImageFromDb={getImageFromDb} 
                navigate={navigate} 
              />
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
