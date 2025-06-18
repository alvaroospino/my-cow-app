// src/utils/indexedDb.js
const DB_NAME = 'InventarioGanaderoDB';
const DB_VERSION = 1;
const STORE_NAME = 'cowImages'; // Donde guardaremos las imágenes

let db;

function openDB() {
  return new Promise((resolve, reject) => {
    // Si la base de datos ya está abierta, la devolvemos
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' }); // 'id' será el ID de la vaca
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

/**
 * Guarda una imagen (Blob o File) en IndexedDB.
 * @param {string} id - El ID de la vaca asociado a la imagen.
 * @param {Blob | File} imageData - El objeto Blob o File de la imagen.
 * @returns {Promise<void>} Una promesa que se resuelve cuando la imagen es guardada.
 */
export async function saveImage(id, imageData) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id: String(id), image: imageData }); // id como String para keyPath

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtiene una imagen (Blob) de IndexedDB por ID.
 * @param {string} id - El ID de la vaca para obtener su imagen.
 * @returns {Promise<Blob | null>} Una promesa que se resuelve con el Blob de la imagen o null si no se encuentra.
 */
export async function getImage(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(String(id));

    request.onsuccess = () => {
      resolve(request.result ? request.result.image : null);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Elimina una imagen de IndexedDB por ID.
 * @param {string} id - El ID de la vaca cuya imagen se va a eliminar.
 * @returns {Promise<void>} Una promesa que se resuelve cuando la imagen es eliminada.
 */
export async function deleteImage(id) {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(String(id));

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Elimina todas las imágenes de IndexedDB. (Útil para limpieza o desarrollo)
 * @returns {Promise<void>} Una promesa que se resuelve cuando todas las imágenes son eliminadas.
 */
export async function clearAllImages() {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear(); // Borra todos los objetos de la Object Store

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}