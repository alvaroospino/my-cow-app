// src/hooks/useCowData.js
import { useState, useEffect, useCallback } from 'react';
import * as cowService from '../services/cowService';

const useCowData = () => {
  const [cows, setCows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función interna para cargar las vacas, reutilizable
  const loadCowsData = useCallback(() => {
    setIsLoading(true);
    const storedCows = cowService.getCows();
    setCows(storedCows);
    setIsLoading(false);
  }, []); // No tiene dependencias externas, es estable

  // Carga las vacas de LocalStorage al iniciar el componente
  useEffect(() => {
    loadCowsData();
  }, [loadCowsData]); // Se ejecuta solo una vez al montar, gracias a useCallback

  const addCowItem = useCallback((newCowData) => {
    const addedCow = cowService.addCow(newCowData);
    setCows(prevCows => [...prevCows, addedCow]);
    return addedCow;
  }, []);

  const getCowItemById = useCallback((id) => {
    return Array.isArray(cows) ? cows.find(cow => cow.id === id) : undefined;
  }, [cows]);

  const updateCowItem = useCallback((updatedCow) => {
    const result = cowService.updateCow(updatedCow);
    if (result) {
      setCows(prevCows => prevCows.map(cow => (cow.id === updatedCow.id ? updatedCow : cow)));
    }
    return result;
  }, []);

  const deleteCowItem = useCallback((id) => {
    const success = cowService.deleteCow(id);
    if (success) {
      setCows(prevCows => prevCows.filter(cow => cow.id !== id));
    }
    return success;
  }, []);

  // --- NUEVAS FUNCIONES PARA EL HOOK ---

  const exportData = useCallback(() => {
    return cowService.exportAllCows();
  }, []);

  const importData = useCallback((data) => {
    const success = cowService.importCows(data);
    if (success) {
      loadCowsData(); // Recargar el estado después de la importación
    }
    return success;
  }, [loadCowsData]); // Depende de loadCowsData para recargar

  return {
    cows,
    isLoading,
    addCow: addCowItem,
    getCowById: getCowItemById,
    updateCow: updateCowItem,
    deleteCow: deleteCowItem,
    exportData, // Exportar la función de exportación
    importData, // Exportar la función de importación
  };
};

export default useCowData;