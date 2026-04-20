import { GAME_CONFIG } from './config/constants.js';
import { createGameLoop } from './core/gameLoop.js';
import { createInitialState, normalizeState } from './core/gameState.js';
import { createStore } from './core/store.js';
import { createSystemManager } from './core/systemManager.js';
import { loadState, saveState } from './persistence/saveRepository.js';
import { combatSystem } from './systems/combatSystem.js';
import { passiveSystem } from './systems/passiveSystem.js';
import { progressionSystem } from './systems/progressionSystem.js';
import { recruitmentSystem } from './systems/recruitmentSystem.js';
import { equipmentSystem } from './systems/equipmentSystem.js';
import { render, setStatus } from './ui/render.js';

async function bootstrap() {
  const ui = getUiRefs();
  setStatus(ui, 'Loading save data...');

  const loaded = await loadState();
  const state = normalizeState(loaded ?? createInitialState());
  const store = createStore(state);

  recruitmentSystem.initializeStarter(state);

  const systemManager = createSystemManager();
  systemManager.register(combatSystem);
  systemManager.register(passiveSystem);
  systemManager.register(progressionSystem);

  const gameLoop = createGameLoop({
    state,
    config: GAME_CONFIG,
    systemManager,
    onStep: ({ ctx }) => {
      if (ctx.events.length > 0) {
        setStatus(ui, ctx.events[ctx.events.length - 1]);
      }

      state.meta.updatedAt = Date.now();
      state.meta.lastActiveAt = Date.now();
      render(state, ui);
    },
    onAutosave: async (nextState) => {
      nextState.runtime.autosaveCount += 1;
      await saveState(nextState);
      setStatus(ui, `Autosaved at ${new Date().toLocaleTimeString()}.`, true);
    }
  });

  wireUi(ui, store, gameLoop);
  render(state, ui);
  setStatus(ui, 'Combat and passive systems are running.');
  gameLoop.start();
}

function wireUi(ui, store, gameLoop) {
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

      render(store.getState(), ui);
    });
  });

  ui.combatPanel.addEventListener('change', (event) => {
    const select = event.target.closest('#combat-area-select');
    if (!select) {
      return;
    }

    const state = store.getState();
    const changed = combatSystem.selectArea(state, select.value);
    if (changed) {
      gameLoop.markDirty();
      setStatus(ui, 'Combat area changed.');
      render(state, ui);
    }
  });

  ui.inventoryPanel.addEventListener('change', (event) => {
    const select = event.target.closest('select[data-equip-instance][data-equip-slot]');
    if (!select) {
      return;
    }

    const { equipInstance: instanceId, equipSlot: slotId } = select.dataset;
    const nextItemId = select.value;
    const state = store.getState();

    const result = nextItemId
      ? equipmentSystem.equip(state, instanceId, nextItemId, slotId)
      : equipmentSystem.unequip(state, instanceId, slotId);

    if (result.ok) {
      gameLoop.markDirty();
      setStatus(ui, nextItemId ? 'Equipment updated.' : 'Equipment removed.', true);
      render(state, ui);
      return;
    }

    setStatus(ui, result.reason ?? 'Unable to change equipment.');
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
    combatPanel: document.querySelector('[data-panel="combat"]'),
    inventoryPanel: document.querySelector('[data-panel="inventory"]'),
    statusLine: document.getElementById('status-line')
  };
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
});
