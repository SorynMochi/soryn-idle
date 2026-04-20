import { DB_CONFIG } from '../config/constants.js';

export function openSaveDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_CONFIG.storeName)) {
        db.createObjectStore(DB_CONFIG.storeName, { keyPath: 'slotId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGet(slotId) {
  const db = await openSaveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_CONFIG.storeName, 'readonly');
    const store = tx.objectStore(DB_CONFIG.storeName);
    const request = store.get(slotId);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function idbPut(slotId, state) {
  const db = await openSaveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_CONFIG.storeName, 'readwrite');
    const store = tx.objectStore(DB_CONFIG.storeName);
    store.put({ slotId, state });

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbDelete(slotId) {
  const db = await openSaveDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_CONFIG.storeName, 'readwrite');
    const store = tx.objectStore(DB_CONFIG.storeName);
    store.delete(slotId);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
