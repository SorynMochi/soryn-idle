import { GAME_CONFIG } from './config/constants.js';
import { createInitialState, normalizeState } from './core/gameState.js';
import { createStore } from './core/store.js';
import { loadState, saveState } from './persistence/saveRepository.js';
import { calculateOfflineProgress } from './systems/offlineProgress.js';
import { render, setStatus } from './ui/render.js';
import { combatSystem } from './systems/combatSystem.js';
import { partySystem } from './systems/partySystem.js';
import { progressionSystem } from './systems/progressionSystem.js';
import { recruitmentSystem } from './systems/recruitmentSystem.js';
import { upgradeSystem } from './systems/upgradeSystem.js';
import { passiveSystem } from './systems/passiveSystem.js';
import { render, setOfflineSummary, setStatus } from './ui/render.js';

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
  const wasStarterAssigned = recruitmentSystem.initializeStarter(state);

  const offlineResult = applyOfflineProgress(state);
  if (offlineResult.ms > 0) {
    setOfflineSummary(
      ui,
      `Offline progress: ${Math.floor(offlineResult.ms / 1000)}s simulated. +${offlineResult.gold} gold, +${offlineResult.xp} xp, +${offlineResult.passive} passive resources`
    );
  } else {
    setOfflineSummary(ui, 'Offline progress: none');
  }

  const systemManager = createSystemManager();
  systemManager.register(combatSystem);
  systemManager.register(progressionSystem);
  systemManager.register(passiveSystem);
  systemManager.register(upgradeSystem);
  systemManager.register(recruitmentSystem);
  systemManager.register(partySystem);

  const gameLoop = createGameLoop({
    state,
    config: GAME_CONFIG,
    systemManager,
    onStep: ({ ctx }) => {
      if (ctx.events.length) {
        setStatus(ui, ctx.events[ctx.events.length - 1]);
      }
      state.meta.updatedAt = Date.now();
      state.meta.lastActiveAt = Date.now();
    },
    meta: {
      ...current.meta,
      updatedAt: Date.now(),
      lastActiveAt: Date.now()
    }
  }), 'offline-ready');

  setStatus(ui, offline.summary);

  wireTabs(ui, store);
  if (wasStarterAssigned) {
    setStatus(ui, 'The Vanguard Caelan joins your party. Recruit more allies with Crystal Shards.');
  }

  render(state, ui);
  gameLoop.start();

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

  if (steps <= 0) {
    return { ms: 0, gold: 0, xp: 0, passive: 0 };
  }

  const beforeGold = state.economy.gold;
  const beforeXp = state.hero.xp;
  const beforePassive = Object.values(state.passive.resources).reduce((total, value) => total + value, 0);

  const systemManager = createSystemManager();
  systemManager.register(combatSystem);
  systemManager.register(progressionSystem);
  systemManager.register(passiveSystem);
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

  return {
    ms: steps * stepMs,
    gold: Math.floor(state.economy.gold - beforeGold),
    xp: Math.floor(state.hero.xp - beforeXp),
    passive: Math.floor(Object.values(state.passive.resources).reduce((total, value) => total + value, 0) - beforePassive)
  };
}
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

  ui.pullRecruitButton.addEventListener('click', () => {
    const result = recruitmentSystem.performPull(state);
    if (!result.ok) {
      setStatus(ui, result.reason);
      render(state, ui);
      return;
    }

    gameLoop.markDirty();
    setStatus(ui, `Recruited ${result.name} (${result.tierId.toUpperCase()}).`);
    render(state, ui);
  });

  ui.passivePanel.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-passive-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.passiveAction;
    const categoryId = button.dataset.category;

    if (!categoryId) {
      return;
    }

    if (action === 'select') {
      const selected = passiveSystem.selectCategory(state, categoryId);
      if (selected) {
        gameLoop.markDirty();
        setStatus(ui, 'Passive action selected.');
      }
    }

    if (action === 'unlock') {
      const unlocked = passiveSystem.tryUnlockCategory(state, categoryId);
      if (unlocked) {
        gameLoop.markDirty();
        setStatus(ui, 'Unlocked passive action.');
      }
    }

    if (action === 'upgrade') {
      const upgraded = passiveSystem.tryUpgradeCategory(state, categoryId);
      if (upgraded) {
        gameLoop.markDirty();
        setStatus(ui, 'Passive action upgraded.');
      }
    }

    render(state, ui);
  });

  ui.partyPanel.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const instanceId = button.dataset.instanceId;
    const slotIndex = Number(button.dataset.slot);

    if (action === 'assign' && instanceId && Number.isInteger(slotIndex)) {
      const assigned = partySystem.assign(state, instanceId, slotIndex);
      if (assigned) {
        gameLoop.markDirty();
        setStatus(ui, 'Assigned party member.');
      }
    }

    if (action === 'remove' && Number.isInteger(slotIndex)) {
      const removed = partySystem.remove(state, slotIndex);
      if (removed) {
        gameLoop.markDirty();
        setStatus(ui, 'Removed party member.');
      }
    }

    render(state, ui);
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
    heroStats: document.getElementById('hero-stats'),
    worldStats: document.getElementById('world-stats'),
    economyStats: document.getElementById('economy-stats'),
    upgradeStats: document.getElementById('upgrade-stats'),
    recruitStats: document.getElementById('recruit-stats'),
    recruitResult: document.getElementById('recruit-result'),
    recruitRates: document.getElementById('recruit-rates'),
    partyTotals: document.getElementById('party-totals'),
    partyActive: document.getElementById('party-active'),
    partyBench: document.getElementById('party-bench'),
    partyPanel: document.getElementById('party-panel'),
    passivePanel: document.getElementById('passive-panel'),
    passiveStats: document.getElementById('passive-stats'),
    passiveCategories: document.getElementById('passive-categories'),
    status: document.getElementById('status'),
    offlineSummary: document.getElementById('offline-summary'),
    buyAttackButton: document.getElementById('buy-attack'),
    buyVitalityButton: document.getElementById('buy-vitality'),
    pullRecruitButton: document.getElementById('pull-recruit')
  };
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});
