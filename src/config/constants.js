export const GAME_CONFIG = {
  version: 3,
  tickMs: 100,
  maxStepsPerFrame: 10,
  renderIntervalMs: 150,
  autosaveIntervalMs: 10_000,
  offline: {
    maxMs: 8 * 60 * 60 * 1000,
    stepMs: 250
  }
};

export const STORAGE_KEYS = {
  activeSlot: 'idleRpg.activeSlot',
  lastSavedAt: 'idleRpg.lastSavedAt',
  version: 'idleRpg.version',
  snapshotPrefix: 'idleRpg.snapshot.'
};

export const DB_CONFIG = {
  name: 'idleRpgSaves',
  version: 3,
  storeName: 'saves'
};
