import { GAME_CONFIG } from './config/constants.js';
import { createInitialState, normalizeState } from './core/gameState.js';
import { createGameLoop } from './core/gameLoop.js';
import { createSystemManager } from './core/systemManager.js';
import { loadState, saveState } from './persistence/saveRepository.js';
import { combatSystem } from './systems/combatSystem.js';
import { progressionSystem } from './systems/progressionSystem.js';
import { upgradeSystem } from './systems/upgradeSystem.js';
import { render, setOfflineSummary, setStatus } from './ui/render.js';

async function bootstrap() {
  const ui = getUiRefs();
  setStatus(ui, 'Loading save...');

  const loaded = await loadState();
  const state = normalizeState(loaded ?? createInitialState());

  const offlineResult = applyOfflineProgress(state);
  if (offlineResult.ms > 0) {
    setOfflineSummary(
      ui,
      `Offline progress: ${Math.floor(offlineResult.ms / 1000)}s simulated. +${offlineResult.gold} gold, +${offlineResult.xp} xp`
    );
  } else {
    setOfflineSummary(ui, 'Offline progress: none');
  }

  const systemManager = createSystemManager();
  systemManager.register(combatSystem);
  systemManager.register(progressionSystem);
  systemManager.register(upgradeSystem);

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
    onRender: (current) => render(current, ui),
    onAutosave: async (current) => {
      await saveState(current);
      setStatus(ui, `Autosaved at ${new Date().toLocaleTimeString()}`);
    }
  });

  wireUiHandlers(ui, state, gameLoop);

  render(state, ui);
  setStatus(ui, 'Running');
  gameLoop.start();

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
      state.meta.lastActiveAt = Date.now();
      await saveState(state);
    }
  });

  window.addEventListener('beforeunload', () => {
    state.meta.lastActiveAt = Date.now();
    saveState(state);
  });
}

function applyOfflineProgress(state) {
  const now = Date.now();
  const last = state.meta.lastActiveAt ?? now;
  const elapsed = Math.max(0, now - last);
  const offlineMs = Math.min(elapsed, GAME_CONFIG.offline.maxMs);
  const stepMs = GAME_CONFIG.offline.stepMs;
  const steps = Math.floor(offlineMs / stepMs);

  if (steps <= 0) {
    return { ms: 0, gold: 0, xp: 0 };
  }

  const beforeGold = state.economy.gold;
  const beforeXp = state.hero.xp;

  const systemManager = createSystemManager();
  systemManager.register(combatSystem);
  systemManager.register(progressionSystem);

  for (let i = 0; i < steps; i += 1) {
    systemManager.runStep(state, { events: [] }, stepMs);
  }

  state.meta.lastActiveAt = now;
  state.meta.updatedAt = now;

  return {
    ms: steps * stepMs,
    gold: Math.floor(state.economy.gold - beforeGold),
    xp: Math.floor(state.hero.xp - beforeXp)
  };
}

function wireUiHandlers(ui, state, gameLoop) {
  ui.buyAttackButton.addEventListener('click', () => {
    const bought = upgradeSystem.tryBuyAttack(state);
    if (bought) {
      gameLoop.markDirty();
      setStatus(ui, 'Purchased attack upgrade.');
      render(state, ui);
    }
  });

  ui.buyVitalityButton.addEventListener('click', () => {
    const bought = upgradeSystem.tryBuyVitality(state);
    if (bought) {
      gameLoop.markDirty();
      setStatus(ui, 'Purchased vitality upgrade.');
      render(state, ui);
    }
  });
}

function getUiRefs() {
  return {
    heroStats: document.getElementById('hero-stats'),
    worldStats: document.getElementById('world-stats'),
    economyStats: document.getElementById('economy-stats'),
    upgradeStats: document.getElementById('upgrade-stats'),
    status: document.getElementById('status'),
    offlineSummary: document.getElementById('offline-summary'),
    buyAttackButton: document.getElementById('buy-attack'),
    buyVitalityButton: document.getElementById('buy-vitality')
  };
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Boot failure', error);
});
