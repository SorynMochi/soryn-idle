import { STORAGE_KEYS } from '../config/constants.js';
import { idbGet, idbPut } from './indexedDb.js';

const DEFAULT_SLOT = 'slot-1';
const inMemorySaves = new Map();

function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (_error) {
    return false;
  }
}

function getSnapshotKey(slotId) {
  return `${STORAGE_KEYS.snapshotPrefix}${slotId}`;
}

export function getActiveSlot() {
  return safeLocalStorageGet(STORAGE_KEYS.activeSlot) ?? DEFAULT_SLOT;
}

export function setActiveSlot(slotId) {
  safeLocalStorageSet(STORAGE_KEYS.activeSlot, slotId);
}

export async function loadState() {
  const slotId = getActiveSlot();

  try {
    const result = await idbGet(slotId);
    if (result?.state) {
      return result.state;
    }
  } catch (_error) {
    // fall through to alternate storage
  }

  const snapshot = safeLocalStorageGet(getSnapshotKey(slotId));
  if (snapshot) {
    try {
      return JSON.parse(snapshot);
    } catch (_error) {
      // fall through
    }
  }

  return inMemorySaves.get(slotId) ?? null;
}

export async function saveState(state) {
  const slotId = getActiveSlot();
  let persisted = false;

  try {
    await idbPut(slotId, state);
    persisted = true;
  } catch (_error) {
    persisted = false;
  }

  if (!persisted) {
    const snapshotSaved = safeLocalStorageSet(getSnapshotKey(slotId), JSON.stringify(state));
    if (!snapshotSaved) {
      inMemorySaves.set(slotId, structuredClone(state));
    }
  }

  safeLocalStorageSet(STORAGE_KEYS.lastSavedAt, String(Date.now()));
  safeLocalStorageSet(STORAGE_KEYS.version, String(state.meta.version));
}
