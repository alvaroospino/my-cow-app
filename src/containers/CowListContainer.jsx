// src/containers/CowListContainer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCowData from '../hooks/useCowData';
import CowCard from '../components/CowCard';
import Modal from '../components/Modal';
import { FaDownload, FaUpload } from 'react-icons/fa'; // Iconos para importar/exportar
// [CAMBIO PARA INDEXEDDB] Importamos deleteImage y getImage de IndexedDB
import { deleteImage, getImage } from '../utils/indexedDb'; // getImage se usará en CowCard

const CowListContainer = () => {
  const navigate = useNavigate();
  const { cows, deleteCow, exportData, importData, getCowById } = useCowData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('name-asc');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cowToDeleteId, setCowToDeleteId] = useState(null);

  const handleView = (id) => {
    navigate(`/vacas/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/vacas/editar/${id}`);
  };

  // [CAMBIO PARA INDEXEDDB] Modificamos handleDeleteClick para preparar la eliminación de la imagen
  const handleDeleteClick = (id) => {
    setCowToDeleteId(id);
    setShowDeleteModal(true);
  };

  // [CAMBIO PARA INDEXEDDB] Modificamos confirmDelete para eliminar también la imagen de IndexedDB
  const confirmDelete = async () => { // Marcar como async
    if (cowToDeleteId) {
      const cowName = getCowById(cowToDeleteId)?.name || 'esta vaca';
      const success = deleteCow(cowToDeleteId); // Esto actualiza el estado de las vacas

      if (success) {
        try {
          await deleteImage(cowToDeleteId);
          console.log(`Imagen de vaca ${cowToDeleteId} eliminada de IndexedDB.`);
        } catch (error) {
          console.error("Error al eliminar imagen de IndexedDB:", error);
        }
        alert(`Vaca "${cowName}" eliminada con éxito!`);
      } else {
        alert('Error al eliminar la vaca.');
      }
      setShowDeleteModal(false);
      setCowToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCowToDeleteId(null);
  };

  const filteredAndSortedCows = useMemo(() => {
    let processedCows = [...cows];

    if (filterType !== 'all') {
      processedCows = processedCows.filter(cow => cow.ownershipType === filterType);
    }

    if (searchTerm) {
      processedCows = processedCows.filter(cow =>
        cow.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    processedCows.sort((a, b) => {
      switch (sortOrder) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-asc':
          return new Date(a.registrationDate) - new Date(b.registrationDate);
        case 'date-desc':
          return new Date(b.registrationDate) - new Date(a.registrationDate);
        default:
          return 0;
      }
    });

    return processedCows;
  }, [cows, searchTerm, filterType, sortOrder]);

  const handleExportData = () => {
    // NOTA: Esta exportación SOLO exportará los datos de la vaca (nombre, etc.),
    // NO las imágenes de IndexedDB. Para exportar las imágenes, necesitarías
    // leer todos los Blobs de IndexedDB, convertirlos a Base64 y añadirlos
    // al JSON, lo cual puede generar un archivo JSON muy grande.
    const dataToExport = exportData();
    if (dataToExport.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const filename = `inventario_vacas_${new Date().toISOString().slice(0, 10)}.json`;
    const jsonStr = JSON.stringify(dataToExport, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`Datos exportados como "${filename}"`);
  };

  const handleImportData = (event) => {
    // NOTA: Esta importación SOLO importará los datos de la vaca,
    // NO las imágenes. Si importas un JSON que contenía Base64 en el campo
    // 'photo', se guardará como Base64 en el modelo, pero NO se transferirá
    // automáticamente a IndexedDB.
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importData(importedData)) {
          alert('Datos importados con éxito! La página se actualizará.');
        } else {
          alert('Error al importar datos. Asegúrate de que el archivo sea un JSON válido de vacas.');
        }
      } catch (error) {
        console.error("Error al parsear el archivo JSON:", error);
        alert('Error: El archivo no es un formato JSON válido.');
      }
    };
    reader.onerror = () => {
      alert('Error al leer el archivo.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="cow-list-page">
      <h2>Inventario de Vacas</h2>

      <div className="cow-list-controls">
        <div className="control-group">
          <label htmlFor="search">Buscar por Nombre:</label>
          <input
            type="text"
            id="search"
            placeholder="Ej. Lola, Manchas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="control-group">
          <label htmlFor="filter">Filtrar por Tipo:</label>
          <select
            id="filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="propiedad">Propiedad</option>
            <option value="particion">Partición</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="sort">Ordenar por:</label>
          <select
            id="sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="name-desc">Nombre (Z-A)</option>
            <option value="date-asc">Fecha (Antiguas primero)</option>
            <option value="date-desc">Fecha (Recientes primero)</option>
          </select>
        </div>
      </div>

      <div className="data-management-actions">
        <button className="btn btn-export" onClick={handleExportData}>
          <FaDownload /> Exportar Datos
        </button>
        <label htmlFor="import-file" className="btn btn-import">
          <FaUpload /> Importar Datos
          <input
            type="file"
            id="import-file"
            accept=".json"
            onChange={handleImportData}
            style={{ display: 'none' }}
          />
        </label>
      </div>


      {filteredAndSortedCows.length === 0 ? (
        <p className="no-cows-message">
          No hay vacas registradas o que coincidan con los criterios.
          <br /> ¡Anímate a <span onClick={() => navigate('/vacas/nueva')} style={{cursor: 'pointer', textDecoration: 'underline', color: '#3498db'}}>registrar una nueva vaca</span>!
        </p>
      ) : (
        <div className="cow-list-grid">
          {filteredAndSortedCows.map((cow) => (
            // [CAMBIO PARA INDEXEDDB] Pasa getImage para que CowCard cargue la imagen
            <CowCard
              key={cow.id}
              cow={cow}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              getImageFromDb={getImage} // Pasa la función para cargar la imagen
            />
          ))}
        </div>
      )}

      {showDeleteModal && (
        <Modal
          title="Confirmar Eliminación"
          onClose={cancelDelete}
          actions={
            <>
              <button className="btn secondary" onClick={cancelDelete}>Cancelar</button>
              <button className="btn primary" onClick={confirmDelete}>Eliminar</button>
            </>
          }
        >
          <p>¿Estás seguro de que quieres eliminar a la vaca "{getCowById(cowToDeleteId)?.name || 'esta vaca'}"?</p>
          <p>¡Esta acción no se puede deshacer!</p>
        </Modal>
      )}
    </div>
  );
};

export default CowListContainer;