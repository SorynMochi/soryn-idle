import { STORAGE_KEYS } from '../config/constants.js';
import { idbGet, idbPut } from './indexedDb.js';

const DEFAULT_SLOT = 'slot-1';

export function getActiveSlot() {
  return localStorage.getItem(STORAGE_KEYS.activeSlot) ?? DEFAULT_SLOT;
}

export function setActiveSlot(slotId) {
  localStorage.setItem(STORAGE_KEYS.activeSlot, slotId);
}

export async function loadState() {
  const slotId = getActiveSlot();
  const result = await idbGet(slotId);
  return result?.state ?? null;
}

export async function saveState(state) {
  const slotId = getActiveSlot();
  await idbPut(slotId, state);

  localStorage.setItem(STORAGE_KEYS.lastSavedAt, String(Date.now()));
  localStorage.setItem(STORAGE_KEYS.version, String(state.meta.version));
}
