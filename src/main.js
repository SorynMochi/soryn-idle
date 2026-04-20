import { GAME_CONFIG } from './config/constants.js';
import { createGameLoop } from './core/gameLoop.js';
import { createInitialState, normalizeState } from './core/gameState.js';
import { createStore } from './core/store.js';
import { createSystemManager } from './core/systemManager.js';
import { clearState, loadState, saveState } from './persistence/saveRepository.js';
import { combatSystem } from './systems/combatSystem.js';
import { passiveSystem } from './systems/passiveSystem.js';
import { progressionSystem } from './systems/progressionSystem.js';
import { recruitmentSystem } from './systems/recruitmentSystem.js';
import { equipmentSystem } from './systems/equipmentSystem.js';
import { partySystem } from './systems/partySystem.js';
import { airshipQuestSystem } from './systems/airshipQuestSystem.js';
import { applyOfflineProgress } from './systems/offlineProgress.js';
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
  systemManager.register(airshipQuestSystem);

  const offlineResult = applyOfflineProgress(state, systemManager, GAME_CONFIG, Date.now());

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
  setStatus(ui, offlineResult.summary, true);
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

  ui.combatPanel.addEventListener('click', (event) => {
    const toggleButton = event.target.closest('button[data-combat-toggle]');
    if (!toggleButton) {
      return;
    }

    const state = store.getState();
    const changed = combatSystem.setAutoEnabled(state, !state.combat.autoEnabled);
    if (changed) {
      gameLoop.markDirty();
      setStatus(ui, state.combat.autoEnabled ? 'Auto-combat started.' : 'Auto-combat paused.', true);
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


  ui.recruitPanel.addEventListener('click', (event) => {
    const pullButton = event.target.closest('button[data-recruit-pull]');
    if (!pullButton) {
      return;
    }

    const state = store.getState();
    const result = recruitmentSystem.performPull(state);
    if (!result.ok) {
      setStatus(ui, result.reason ?? 'Recruitment failed.');
      render(state, ui);
      return;
    }

    gameLoop.markDirty();
    setStatus(ui, `Recruited ${result.name} (${result.tierId}).`, true);
    render(state, ui);
  });

  ui.passivePanel.addEventListener('click', (event) => {
    const state = store.getState();

    const selectButton = event.target.closest('button[data-passive-select]');
    if (selectButton) {
      const categoryId = selectButton.dataset.passiveSelect;
      const changed = passiveSystem.selectCategory(state, categoryId);
      if (changed) {
        gameLoop.markDirty();
        setStatus(ui, 'Passive route changed.', true);
      }
      render(state, ui);
      return;
    }

    const unlockButton = event.target.closest('button[data-passive-unlock]');
    if (unlockButton) {
      const categoryId = unlockButton.dataset.passiveUnlock;
      const changed = passiveSystem.tryUnlockCategory(state, categoryId);
      if (changed) {
        gameLoop.markDirty();
        setStatus(ui, 'Passive route unlocked.', true);
      } else {
        setStatus(ui, 'Unable to unlock route.');
      }
      render(state, ui);
      return;
    }

    const upgradeButton = event.target.closest('button[data-passive-upgrade]');
    if (upgradeButton) {
      const categoryId = upgradeButton.dataset.passiveUpgrade;
      const changed = passiveSystem.tryUpgradeCategory(state, categoryId);
      if (changed) {
        gameLoop.markDirty();
        setStatus(ui, 'Passive route upgraded.', true);
      } else {
        setStatus(ui, 'Unable to upgrade route.');
      }
      render(state, ui);
    }
  });

  ui.partyPanel.addEventListener('change', (event) => {
    const select = event.target.closest('select[data-party-slot]');
    if (!select) {
      return;
    }

    const slotIndex = Number.parseInt(select.dataset.partySlot ?? '-1', 10);
    if (slotIndex < 0) {
      return;
    }

    const state = store.getState();
    const selectedId = select.value;
    let changed = false;

    if (!selectedId) {
      changed = partySystem.remove(state, slotIndex);
    } else {
      changed = partySystem.assign(state, selectedId, slotIndex);
    }

    partySystem.normalize(state);

    if (changed) {
      gameLoop.markDirty();
      setStatus(ui, 'Party updated.', true);
    } else {
      setStatus(ui, 'Unable to update party slot.');
    }

    render(state, ui);
  });

  ui.questsPanel.addEventListener('change', (event) => {
    const select = event.target.closest('select[data-quest-assignment][data-assignment-slot]');
    if (!select) {
      return;
    }

    const questId = select.dataset.questAssignment;
    const slot = Number.parseInt(select.dataset.assignmentSlot ?? '-1', 10);
    if (!questId || slot < 0) {
      return;
    }

    const state = store.getState();
    if (!Array.isArray(state.ui.airshipAssignments[questId])) {
      state.ui.airshipAssignments[questId] = [];
    }

    state.ui.airshipAssignments[questId][slot] = select.value;
    gameLoop.markDirty();
    render(state, ui);
  });

  ui.questsPanel.addEventListener('click', (event) => {
    const launchButton = event.target.closest('button[data-quest-launch]');
    if (!launchButton) {
      return;
    }

    const questId = launchButton.dataset.questLaunch;
    const state = store.getState();
    const assignments = state.ui.airshipAssignments[questId] ?? [];
    const result = airshipQuestSystem.startQuest(state, questId, assignments);

    if (!result.ok) {
      setStatus(ui, result.reason ?? 'Unable to launch dispatch.');
      render(state, ui);
      return;
    }

    state.ui.airshipAssignments[questId] = [];
    gameLoop.markDirty();
    setStatus(ui, `${result.quest.title} launched.`, true);
    render(state, ui);
  });

  ui.overviewPanel.addEventListener('click', async (event) => {
    const resetButton = event.target.closest('button[data-new-game-reset]');
    if (!resetButton) {
      return;
    }

    const confirmed = window.confirm('Reset current save slot and start a new game? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    await clearState();
    const state = store.getState();
    const freshState = createInitialState();
    const normalized = normalizeState(freshState);

    Object.keys(state).forEach((key) => delete state[key]);
    Object.assign(state, normalized);
    recruitmentSystem.initializeStarter(state);

    gameLoop.markDirty();
    setStatus(ui, 'Started a new game.', true);
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
    craftingContent: document.getElementById('crafting-content'),
    combatPanel: document.querySelector('[data-panel="combat"]'),
    overviewPanel: document.querySelector('[data-panel="overview"]'),
    recruitPanel: document.querySelector('[data-panel="recruit"]'),
    passivePanel: document.querySelector('[data-panel="passive"]'),
    partyPanel: document.querySelector('[data-panel="party"]'),
    questsPanel: document.querySelector('[data-panel="quests"]'),
    inventoryPanel: document.querySelector('[data-panel="inventory"]'),
    statusLine: document.getElementById('status-line')
  };
}

bootstrap().catch((error) => {
  const statusLine = document.getElementById('status-line');
  if (statusLine) {
    statusLine.classList.remove('good');
    statusLine.textContent = `Boot failed: ${error?.message ?? 'Unknown error'}. Check the browser console for details.`;
  }

  console.error(error);
});
