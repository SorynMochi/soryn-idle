import { GAME_CONFIG } from './config/constants.js';
import { createInitialState, normalizeState } from './core/gameState.js';
import { createStore } from './core/store.js';
import { loadState, saveState } from './persistence/saveRepository.js';
import { calculateOfflineProgress } from './systems/offlineProgress.js';
import { render, setStatus } from './ui/render.js';

async function bootstrap() {
  const ui = getUiRefs();
  setStatus(ui, 'Loading save data...');

  const loaded = await loadState();
  const state = normalizeState(loaded ?? createInitialState());
  const store = createStore(state);

  const offline = calculateOfflineProgress(store.getState());
  store.update((current) => ({
    ...current,
    runtime: {
      ...current.runtime,
      lastOfflineDurationMs: offline.durationMs
    },
    meta: {
      ...current.meta,
      updatedAt: Date.now(),
      lastActiveAt: Date.now()
    }
  }), 'offline-ready');

  setStatus(ui, offline.summary);

  wireTabs(ui, store);

  store.subscribe((nextState, reason) => {
    render(nextState, ui);
    if (reason === 'tab-change') {
      setStatus(ui, `Viewing ${nextState.ui.activeTab[0].toUpperCase()}${nextState.ui.activeTab.slice(1)}.`);
    }
  });

  render(store.getState(), ui);

  startAutosave(store, ui);
  wireLifecyclePersistence(store);
}

function startAutosave(store, ui) {
  setInterval(async () => {
    const now = Date.now();

    store.update((current) => ({
      ...current,
      meta: {
        ...current.meta,
        updatedAt: now,
        lastActiveAt: now
      },
      runtime: {
        ...current.runtime,
        totalPlayTimeMs: current.runtime.totalPlayTimeMs + GAME_CONFIG.autosaveIntervalMs,
        autosaveCount: current.runtime.autosaveCount + 1
      }
    }), 'autosave-tick');

    await saveState(store.getState());
    setStatus(ui, `Autosaved at ${new Date(now).toLocaleTimeString()}.`, true);
  }, GAME_CONFIG.autosaveIntervalMs);
}

function wireLifecyclePersistence(store) {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;

    store.update((current) => ({
      ...current,
      meta: {
        ...current.meta,
        lastActiveAt: Date.now(),
        updatedAt: Date.now()
      }
    }), 'hidden-save');

    saveState(store.getState());
  });

  window.addEventListener('beforeunload', () => {
    store.update((current) => ({
      ...current,
      meta: {
        ...current.meta,
        lastActiveAt: Date.now(),
        updatedAt: Date.now()
      }
    }), 'unload-save');

    saveState(store.getState());
  });
}

function wireTabs(ui, store) {
  ui.tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.dataset.tab;
      store.update((state) => ({
        ...state,
        ui: {
          ...state.ui,
          activeTab: selected
        }
      }), 'tab-change');
    });
  });
}

function getUiRefs() {
  return {
    currencyStrip: document.getElementById('currency-strip'),
    tabButtons: Array.from(document.querySelectorAll('.tab-button')),
    panels: Array.from(document.querySelectorAll('[data-panel]')),
    overviewContent: document.getElementById('overview-content'),
    partyContent: document.getElementById('party-content'),
    recruitContent: document.getElementById('recruit-content'),
    passiveContent: document.getElementById('passive-content'),
    combatContent: document.getElementById('combat-content'),
    questsContent: document.getElementById('quests-content'),
    inventoryContent: document.getElementById('inventory-content'),
    statusLine: document.getElementById('status-line')
  };
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});
