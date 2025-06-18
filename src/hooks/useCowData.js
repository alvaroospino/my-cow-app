import { useState, useEffect, useCallback } from 'react';
import * as cowService from '../services/cowService';
import { getImage } from '../utils/indexedDb'; // <--- ¡Importa getImage de IndexedDB!

const useCowData = () => {
  const [cows, setCows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función interna para cargar las vacas, reutilizable
  const loadCowsData = useCallback(() => {
    setIsLoading(true);
    const storedCows = cowService.getCows();
    setCows(storedCows);
    setIsLoading(false);
  }, []);

  // Carga las vacas de LocalStorage al iniciar el componente
  useEffect(() => {
    loadCowsData();
  }, [loadCowsData]);

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

  // --- NUEVA FUNCIÓN PARA OBTENER IMAGEN POR ID DESDE INDEXEDDB ---
  const getImageFromDb = useCallback(async (id) => {
    return await getImage(id); // Llama a la función getImage de indexedDb.js
  }, []); // Sin dependencias, ya que getImage no necesita datos externos del hook

  const exportData = useCallback(() => {
    return cowService.exportAllCows();
  }, []);

  const importData = useCallback((data) => {
    const success = cowService.importCows(data);
    if (success) {
      loadCowsData();
    }
    return success;
  }, [loadCowsData]);

  return {
    cows,
    isLoading,
    addCow: addCowItem,
    getCowById: getCowItemById,
    updateCow: updateCowItem,
    deleteCow: deleteCowItem,
    exportData,
    importData,
    getImageFromDb, // <--- ¡Exporta la nueva función!
  };
};

export default useCowData;
