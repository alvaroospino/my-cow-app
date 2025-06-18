// src/containers/CowListContainer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCowData from '../hooks/useCowData';
import CowCard from '../components/CowCard';
import Modal from '../components/Modal';
import { FaDownload, FaUpload } from 'react-icons/fa'; // Iconos para importar/exportar

const CowListContainer = () => {
  const navigate = useNavigate();
  // Incluimos exportData y importData del hook
  const { cows, deleteCow, exportData, importData, getCowById } = useCowData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('name-asc');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cowToDeleteId, setCowToDeleteId] = useState(null);

  // Funciones para manejar acciones de CowCard
  const handleView = (id) => {
    navigate(`/vacas/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/vacas/editar/${id}`);
  };

  const handleDeleteClick = (id) => {
    setCowToDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (cowToDeleteId) {
      deleteCow(cowToDeleteId);
      alert('Vaca eliminada con éxito!');
      setShowDeleteModal(false);
      setCowToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCowToDeleteId(null);
  };

  // Lógica de filtrado y ordenamiento de vacas
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

  // --- Lógica de Exportar Datos ---
  const handleExportData = () => {
    const dataToExport = exportData();
    if (dataToExport.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const filename = `inventario_vacas_${new Date().toISOString().slice(0, 10)}.json`;
    const jsonStr = JSON.stringify(dataToExport, null, 2); // Formato legible

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Libera la URL del objeto
    alert(`Datos exportados como "${filename}"`);
  };

  // --- Lógica de Importar Datos ---
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importData(importedData)) { // Llama a la función de importación del hook
          alert('Datos importados con éxito! La página se actualizará.');
          // El hook ya recarga los datos, lo que provocará un re-render
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

      {/* Botones de Importar/Exportar */}
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
            style={{ display: 'none' }} // Esconder el input de archivo
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
            <CowCard
              key={cow.id}
              cow={cow}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
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