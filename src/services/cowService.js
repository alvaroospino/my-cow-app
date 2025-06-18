// src/services/cowService.js

const LS_KEY = 'cow_inventory';

/**
 * Obtiene todas las vacas almacenadas en LocalStorage.
 * @returns {Array} Un array de objetos vaca.
 */
export const getCows = () => {
  try {
    const cows = localStorage.getItem(LS_KEY);
    return cows ? JSON.parse(cows) : [];
  } catch (error) {
    console.error("Error al obtener vacas de LocalStorage:", error);
    return [];
  }
};

/**
 * Guarda un array de vacas en LocalStorage.
 * @param {Array} cows - El array de vacas a guardar.
 */
const saveCows = (cows) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cows));
  } catch (error) {
    console.error("Error al guardar vacas en LocalStorage:", error);
  }
};

/**
 * Añade una nueva vaca al inventario.
 * @param {Object} newCowData - Los datos de la nueva vaca (sin ID).
 * @returns {Object} La vaca recién añadida con su ID.
 */
export const addCow = (newCowData) => {
  const cows = getCows();
  // Genera un ID simple basado en la marca de tiempo.
  // Para una app más robusta, considera una librería como 'uuid'.
  const newCow = { ...newCowData, id: Date.now().toString() };
  cows.push(newCow);
  saveCows(cows);
  return newCow;
};

/**
 * Obtiene una vaca por su ID.
 * @param {string} id - El ID de la vaca.
 * @returns {Object|undefined} La vaca encontrada o undefined si no existe.
 */
export const getCowById = (id) => {
  const cows = getCows();
  return cows.find(cow => cow.id === id);
};

/**
 * Actualiza una vaca existente.
 * @param {Object} updatedCow - Los datos actualizados de la vaca (debe incluir el ID).
 * @returns {Object|undefined} La vaca actualizada o undefined si no se encontró.
 */
export const updateCow = (updatedCow) => {
  let cows = getCows();
  const index = cows.findIndex(cow => cow.id === updatedCow.id);
  if (index !== -1) {
    cows[index] = updatedCow;
    saveCows(cows);
    return updatedCow;
  }
  return undefined; // Vaca no encontrada
};

/**
 * Elimina una vaca por su ID.
 * @param {string} id - El ID de la vaca a eliminar.
 * @returns {boolean} True si se eliminó con éxito, false en caso contrario.
 */
export const deleteCow = (id) => {
  let cows = getCows();
  const initialLength = cows.length;
  cows = cows.filter(cow => cow.id !== id);
  saveCows(cows);
  return cows.length < initialLength; // True si se eliminó al menos una vaca
};

// --- NUEVAS FUNCIONES PARA IMPORTAR/EXPORTAR ---

/**
 * Exporta todos los datos de vacas a un objeto JSON.
 * @returns {Array} Un array de objetos vaca.
 */
export const exportAllCows = () => {
  return getCows();
};

/**
 * Importa datos de vacas, sobrescribiendo los existentes.
 * Opcionalmente, se pueden fusionar los datos en lugar de sobrescribirlos.
 * Para este caso, vamos a SOBREESCRIBIR para simplicidad.
 * @param {Array} newCows - El array de vacas a importar.
 * @returns {boolean} True si la importación fue exitosa.
 */
export const importCows = (newCows) => {
  if (!Array.isArray(newCows)) {
    console.error("Los datos importados no son un array válido.");
    return false;
  }
  // Validación básica para asegurar que son objetos con al menos un ID o nombre
  const validCows = newCows.filter(cow => typeof cow === 'object' && (cow.id || cow.name));
  saveCows(validCows);
  return true;
};