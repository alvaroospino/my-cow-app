// src/hooks/useCowData.js
import { useState, useEffect, useCallback } from 'react';
import * as cowService from '../services/cowService';
// [CAMBIO PARA INDEXEDDB] Importamos clearAllImages para una limpieza profunda si se reinician los datos
import { clearAllImages } from '../utils/indexedDb';

const useCowData = () => {
  const [cows, setCows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCowsData = useCallback(() => {
    setIsLoading(true);
    const storedCows = cowService.getCows();
    setCows(storedCows);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCowsData();
  }, [loadCowsData]);

  // [CAMBIO PARA INDEXEDDB] addCowItem ahora devuelve el objeto de vaca recién añadido (con su ID)
  const addCowItem = useCallback((newCowData) => {
    const addedCow = cowService.addCow(newCowData); // Asegúrate que cowService.addCow asigne un ID
    setCows(prevCows => [...prevCows, addedCow]);
    return addedCow; // Devolvemos el objeto completo con el ID asignado
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
    // [CAMBIO PARA INDEXEDDB] La eliminación de la imagen de IndexedDB se maneja en los contenedores
    // (CowDetailContainer y CowListContainer) porque tienen el ID y pueden hacer el await.
    // Aquí solo nos enfocamos en el modelo de datos.
    return success;
  }, []);

  const exportData = useCallback(() => {
    return cowService.exportAllCows();
  }, []);

  const importData = useCallback(async (data) => { // Marcar como async
    const success = cowService.importCows(data);
    if (success) {
      // [CAMBIO PARA INDEXEDDB] Si importamos nuevos datos, es una buena práctica
      // limpiar las imágenes existentes en IndexedDB (si no vas a reimportar imágenes).
      // Si el JSON importado no contiene Base64 o referencias a imágenes de IndexedDB,
      // las imágenes anteriores quedarían huérfanas si no se limpian.
      // Depende de tu estrategia: si el JSON NO trae imágenes, y las imágenes son solo locales,
      // entonces borra todas las imágenes de IndexedDB.
      // await clearAllImages(); // Descomentar si quieres limpiar todas las imágenes al importar
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
  };
};

export default useCowData;