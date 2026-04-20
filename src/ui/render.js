import { COMBAT_AREAS, COMBAT_AREAS_BY_ID } from '../content/combatAreas.js';
import { CHARACTER_TIERS } from '../content/characterTiers.js';
import { EQUIPMENT_SLOT_ORDER } from '../content/equipment.js';
import { PASSIVE_ACTION_CATEGORIES, PASSIVE_CATEGORY_ORDER } from '../content/passiveActions.js';
import { AIRSHIP_BOARD_UNLOCK, AIRSHIP_QUESTS } from '../content/quests.js';
import { RECRUITMENT_BALANCE } from '../content/recruitmentBalance.js';
import { equipmentSystem } from '../systems/equipmentSystem.js';
import { partySystem } from '../systems/partySystem.js';
import { passiveSystem } from '../systems/passiveSystem.js';
import { recruitmentSystem } from '../systems/recruitmentSystem.js';
import { airshipQuestSystem } from '../systems/airshipQuestSystem.js';
import { craftingSystem } from '../systems/craftingSystem.js';

function row(label, value) {
  return `<div class="row"><span class="row-label">${label}</span><strong>${value}</strong></div>`;
}

export function render(state, ui) {
  ui.currencyStrip.innerHTML = [
    `<span class="currency-pill">Gil: ${Math.floor(state.economy.gold)}</span>`,
    `<span class="currency-pill">Crystal Shards: ${Math.floor(state.economy.shards)}</span>`
  ].join('');

  const activeMembers = partySystem.getActiveMembers(state);
  const partyTotals = partySystem.getPartyTotals(state);
  const selectedArea = COMBAT_AREAS_BY_ID[state.combat.selectedAreaId];

  ui.overviewContent.innerHTML = `<div class="grid-rows">${[
    row('Version', state.meta.version),
    row('Hero Level', state.hero.level),
    row('Hero EXP', `${Math.floor(state.hero.xp)} / ${state.hero.xpToNext}`),
    row('Roster Size', state.roster.ownedInstanceIds.length),
    row('Combat Tick', `${state.combat.tickMs / 1000}s`),
    row('Autosaves', state.runtime.autosaveCount)
  ].join('')}</div>
  <button data-new-game-reset>Start New Game (Reset Save)</button>`;

  ui.partyContent.innerHTML = renderParty(state, activeMembers, partyTotals);
  ui.recruitContent.innerHTML = renderRecruit(state);
  ui.passiveContent.innerHTML = renderPassive(state);
  ui.combatContent.innerHTML = renderCombat(state, selectedArea);

  ui.questsContent.innerHTML = renderQuestBoard(state);
  ui.inventoryContent.innerHTML = renderInventory(state);
  ui.craftingContent.innerHTML = renderCrafting(state);

  setActiveTab(state.ui.activeTab, ui);
}

function renderParty(state, activeMembers, partyTotals) {
  const assigned = new Set(state.party.activeInstanceIds.filter(Boolean));
  const availableMembers = state.roster.ownedInstanceIds
    .map((instanceId) => partySystem.getRosterView(state, instanceId))
    .filter((member) => member && !member.lockState?.locked);

  const slotControls = state.party.activeInstanceIds.map((activeId, slotIndex) => {
    const options = [
      '<option value="">-- Open slot --</option>',
      ...availableMembers
        .filter((member) => member.instanceId === activeId || !assigned.has(member.instanceId))
        .map((member) => `<option value="${member.instanceId}" ${member.instanceId === activeId ? 'selected' : ''}>${member.name} · ${member.instanceId}</option>`)
    ].join('');

    return `<label class="row-label">Slot ${slotIndex + 1}<select data-party-slot="${slotIndex}">${options}</select></label>`;
  }).join('');

  return `<div class="grid-rows">${[
    row('Active Party Size', `${activeMembers.length} / ${state.party.maxSlots}`),
    row('Combined HP', partyTotals.hp),
    row('Combined MP', partyTotals.mp),
    row('Combined ATK', partyTotals.atk),
    row('Combined DEF', partyTotals.def),
    row('Combined MAG', partyTotals.mag),
    row('Combined RES', partyTotals.res),
    row('Combined SPD', partyTotals.spd)
  ].join('')}</div>
  <h3>Assignments</h3>
  <div class="grid-rows">${slotControls}</div>
  <h3>Active Members</h3>
  <ul class="roster-list">${activeMembers
    .map((member) => `<li class="roster-row"><span>${member.name} · Lv.${member.level}</span><span class="muted">EXP ${Math.floor(member.exp)} / ${member.expToNext} · ATK ${member.finalStats.atk} · DEF ${member.finalStats.def} · SPD ${member.finalStats.spd} · Specialty ${member.passiveSpecialty.name}</span></li>`)
    .join('') || '<li class="roster-row">No active members assigned.</li>'}</ul>`;
}

function renderRecruit(state) {
  const probabilities = recruitmentSystem.getTierProbabilities()
    .map(({ tierId, probability }) => {
      const tier = CHARACTER_TIERS[tierId];
      return `<li class="roster-row"><span>${tier?.label ?? tierId}</span><span class="muted">${(probability * 100).toFixed(1)}%</span></li>`;
    })
    .join('');

  const lastPull = state.gacha.lastPullResult
    ? `<p class="note">Last recruit: ${state.gacha.lastPullResult.name} (${CHARACTER_TIERS[state.gacha.lastPullResult.tierId]?.label ?? state.gacha.lastPullResult.tierId}).</p>`
    : '<p class="note">No pulls yet in this session.</p>';

  return `
    <div class="grid-rows">
      ${row('Shard Cost', RECRUITMENT_BALANCE.shardCostPerPull)}
      ${row('Available Shards', Math.floor(state.economy.shards))}
    </div>
    <button data-recruit-pull ${recruitmentSystem.canPull(state) ? '' : 'disabled'}>Perform 1 Pull</button>
    ${lastPull}
    <h3>Tier Rates</h3>
    <ul class="roster-list">${probabilities}</ul>
  `;
}

function renderPassive(state) {
  const categories = passiveSystem.buildCategoryView(state);
  const cards = PASSIVE_CATEGORY_ORDER
    .map((categoryId) => {
      const category = PASSIVE_ACTION_CATEGORIES[categoryId];
      const view = categories.find((entry) => entry.id === categoryId);
      if (!category || !view) return '';

      const selectedText = view.selected ? 'Selected Route' : 'Select Route';
      const selectDisabled = view.unlocked ? '' : 'disabled';
      const unlockDisabled = !view.unlocked && state.economy.gold >= view.unlockCostGold ? '' : 'disabled';
      const upgradeDisabled = view.nextUpgrade && state.economy.gold >= view.nextUpgrade.costGold ? '' : 'disabled';

      return `
        <article class="defeat-card">
          <strong>${view.label}</strong>
          <p class="note">${view.description}</p>
          <div class="grid-rows">
            ${row('Status', view.unlocked ? 'Unlocked' : `Locked · ${view.unlockCostGold} Gil`) }
            ${row('Output / sec', `${view.output.resourcePerSecond.toFixed(2)} ${view.resourceLabel}`)}
            ${row('Upgrade Level', `${view.upgradeLevel} / ${view.maxUpgradeLevel}`)}
            ${row('Specialty Mult', `x${view.specialtyMultiplier.toFixed(2)}`)}
          </div>
          <div class="quest-assignment-grid">
            <button data-passive-select="${view.id}" ${selectDisabled}>${selectedText}</button>
            <button data-passive-unlock="${view.id}" ${view.unlocked ? 'disabled' : unlockDisabled}>Unlock</button>
            <button data-passive-upgrade="${view.id}" ${!view.unlocked || !view.nextUpgrade ? 'disabled' : upgradeDisabled}>
              ${view.nextUpgrade ? `Upgrade (${view.nextUpgrade.costGold} Gil)` : 'Maxed'}
            </button>
          </div>
        </article>
      `;
    })
    .join('');

  return `<div class="grid-rows">${[
    row('Active Passive Route', state.passive.selectedCategoryId),
    row('Aether Ore', Math.floor(state.passive.resources.ore)),
    row('Moonwood Timber', Math.floor(state.passive.resources.timber)),
    row('Starbloom Herbs', Math.floor(state.passive.resources.herbs))
  ].join('')}</div>
  <h3>Routes</h3>
  <div class="defeat-history">${cards}</div>`;
}

function renderQuestBoard(state) {
  if (!state.airshipQuests.unlocked) {
    const unlockInfo = AIRSHIP_BOARD_UNLOCK.params;
    return `
      <div class="grid-rows">
        ${row('Airship Board', 'Locked')}
        ${row('Unlock Requirement', `Hero Lv.${unlockInfo.heroLevel} · ${unlockInfo.totalVictories} total victories`)}
        ${row('Current Progress', `Hero Lv.${state.hero.level} · ${state.combat.totalVictories} victories`)}
      </div>
      <p class="note">Continue progression to open timed airship dispatch contracts.</p>
    `;
  }

  const activeRuns = airshipQuestSystem.getActiveRuns(state)
    .map((run) => renderActiveRun(state, run))
    .join('');

  const availableQuestCards = AIRSHIP_QUESTS.map((quest) => renderQuestCard(state, quest)).join('');

  const historyRows = airshipQuestSystem.getHistory(state)
    .map((entry) => renderQuestHistoryEntry(entry))
    .join('');

  return `
    <div class="grid-rows">
      ${row('Board Status', 'Operational')}
      ${row('Unlocked Routes', `${state.airshipQuests.unlockedQuestIds.length} / ${AIRSHIP_QUESTS.length}`)}
      ${row('Active Dispatches', Object.keys(state.airshipQuests.activeRunsById).length)}
    </div>

    <h3>In Progress</h3>
    <div class="defeat-history">${activeRuns || '<p class="note">No active dispatches.</p>'}</div>

    <h3>Dispatch Board</h3>
    <div class="defeat-history">${availableQuestCards}</div>

    <h3>History</h3>
    <ul class="roster-list">${historyRows || '<li class="roster-row">No dispatch history yet.</li>'}</ul>
  `;
}

function renderQuestCard(state, quest) {
  const status = airshipQuestSystem.getQuestStatus(state, quest);
  const assignments = getAssignmentSelection(state, quest.id, quest.maxAssignees);
  const selectedIds = assignments.filter(Boolean);
  const chance = airshipQuestSystem.calculateSuccessChance(state, quest.id, selectedIds);

  const requirementRows = Object.entries(quest.statRequirements)
    .map(([statKey, value]) => `${statKey.toUpperCase()} ${value}`)
    .join(' · ');

  if (status === 'locked') {
    const unlockText = renderUnlockHint(state, quest.unlock?.params);
    return `
      <article class="defeat-card">
        <strong>${quest.title}</strong>
        <p class="note">${quest.description}</p>
        <p class="muted">Requirements: ${requirementRows}</p>
        <p class="muted">Unlock: ${unlockText}</p>
      </article>
    `;
  }

  if (status === 'in_progress') {
    return `
      <article class="defeat-card">
        <strong>${quest.title}</strong>
        <p class="note">Dispatch already in progress.</p>
      </article>
    `;
  }

  return `
    <article class="defeat-card quest-card">
      <strong>${quest.title}</strong>
      <p class="note">${quest.description}</p>
      <div class="grid-rows">
        ${row('Duration', formatDuration(quest.durationMs))}
        ${row('Stat Thresholds', requirementRows)}
        ${row('Projected Success', `${Math.round(chance * 100)}%`)}
      </div>
      <div class="quest-assignment-grid">
        ${renderAssignmentSelectors(state, quest, assignments)}
      </div>
      <button class="quest-launch" data-quest-launch="${quest.id}">Launch Dispatch</button>
    </article>
  `;
}

function renderAssignmentSelectors(state, quest, assignments) {
  const options = getAssignableMembers(state);

  return Array.from({ length: quest.maxAssignees }).map((_, index) => {
    const selectedId = assignments[index] ?? '';
    const optionTags = [
      '<option value="">-- Open slot --</option>',
      ...options.map((member) => `<option value="${member.instanceId}" ${member.instanceId === selectedId ? 'selected' : ''}>${member.name} · ${formatQuestStats(member.finalStats)}</option>`)
    ].join('');

    return `<label class="row-label">Crew Slot ${index + 1}<select data-quest-assignment="${quest.id}" data-assignment-slot="${index}">${optionTags}</select></label>`;
  }).join('');
}

function renderActiveRun(state, run) {
  const memberNames = run.assignedInstanceIds
    .map((instanceId) => partySystem.getRosterView(state, instanceId)?.name)
    .filter(Boolean)
    .join(', ');

  return `
    <article class="defeat-card">
      <strong>${run.quest.title}</strong>
      <p class="muted">Crew: ${memberNames || 'Unknown'}</p>
      <div class="grid-rows">
        ${row('Projected Success', `${Math.round(run.successChance * 100)}%`)}
        ${row('Time Remaining', formatDuration(run.remainingMs))}
        ${row('Ends At', new Date(run.endsAt).toLocaleTimeString())}
      </div>
    </article>
  `;
}

function renderQuestHistoryEntry(entry) {
  const outcome = entry.success ? 'Success' : 'Failure';
  const memberNames = entry.assignedSnapshot?.map((member) => member.name).join(', ') ?? 'Unknown';

  return `
    <li class="roster-row">
      <span>${entry.questId} · ${outcome}<br /><span class="muted">Crew: ${memberNames}</span></span>
      <span class="muted">${entry.rewards.gil} Gil · ${entry.rewards.shards} Shards</span>
    </li>
  `;
}

function renderUnlockHint(state, params = {}) {
  if (!params.heroLevel && !params.totalVictories) {
    return 'Progress deeper through the campaign.';
  }

  return `Hero Lv.${params.heroLevel ?? state.hero.level} (${state.hero.level}/${params.heroLevel ?? state.hero.level}) · Victories ${state.combat.totalVictories}/${params.totalVictories ?? state.combat.totalVictories}`;
}

function getAssignmentSelection(state, questId, maxAssignees) {
  const stored = state.ui.airshipAssignments?.[questId];
  const normalized = Array.isArray(stored) ? stored.slice(0, maxAssignees) : [];

  while (normalized.length < maxAssignees) {
    normalized.push('');
  }

  return normalized;
}

function getAssignableMembers(state) {
  return state.roster.ownedInstanceIds
    .map((instanceId) => partySystem.getRosterView(state, instanceId))
    .filter((member) => member && !member.lockState?.locked);
}

function formatQuestStats(stats) {
  return `ATK ${stats.atk} DEF ${stats.def} MAG ${stats.mag} RES ${stats.res} SPD ${stats.spd}`;
}

function formatDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function renderInventory(state) {
  const rosterViewsById = Object.fromEntries(
    [...partySystem.getActiveMembers(state), ...partySystem.getBenchMembers(state)].map((member) => [member.instanceId, member])
  );
  const rosterMembers = state.roster.ownedInstanceIds
    .map((instanceId) => rosterViewsById[instanceId])
    .filter(Boolean);

  const equipmentInventoryRows = Object.entries(state.inventory.equipment ?? {})
    .filter(([, count]) => count > 0)
    .map(([itemId, count]) => {
      const item = equipmentSystem.getItemById(itemId);
      if (!item) return '';
      return `<li class="roster-row"><span>${item.name}</span><span class="muted">${item.slot.toUpperCase()} · ${item.category} · Qty ${count}</span></li>`;
    })
    .filter(Boolean)
    .join('');

  const characterRows = rosterMembers
    .map((member) => {
      const slotRows = EQUIPMENT_SLOT_ORDER.map((slotId) => renderEquipmentSlot(state, member, slotId)).join('');
      const specialtyHooks = member.passiveSpecialtyHooks?.hooks ?? {};
      return `
        <li class="equipment-card">
          <div class="equipment-header">
            <strong>${member.name} · Lv.${member.level}</strong>
            <span class="muted">EXP ${Math.floor(member.exp)} / ${member.expToNext} · ${member.passiveSpecialty.name}</span>
          </div>
          <div class="muted specialty-hooks">
            Crafting x${(specialtyHooks.crafting ?? 1).toFixed(2)} ·
            Quest x${(specialtyHooks.questRewards ?? 1).toFixed(2)} ·
            Combat EXP x${(specialtyHooks.combatExp ?? 1).toFixed(2)} ·
            Drops x${(specialtyHooks.itemDropChance ?? 1).toFixed(2)}
          </div>
          <div class="grid-rows">${slotRows}</div>
        </li>
      `;
    })
    .join('');

  return `
    <div class="grid-rows">
      ${row('Owned Equipment Types', Object.entries(state.inventory.equipment ?? {}).filter(([, count]) => count > 0).length)}
      ${row('Total Spare Gear', Object.values(state.inventory.equipment ?? {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0))}
      ${row('Tracked Material Types', Object.keys(state.inventory.materials ?? {}).length)}
      ${row('Equippable Characters', rosterMembers.length)}
    </div>
    <h3>Armory Stock</h3>
    <ul class="roster-list">${equipmentInventoryRows || '<li class="roster-row">No spare gear in inventory.</li>'}</ul>
    <h3>Loadout Management</h3>
    <ul class="roster-list">${characterRows || '<li class="roster-row">No recruited characters yet.</li>'}</ul>
    <p class="note">Inventory has been restructured for persistent loadout control. Accessories are universal. Weapon and armor categories follow each character profile.</p>
  `;
}

function renderCrafting(state) {
  const hooks = craftingSystem.getCraftingHooks(state);
  const categories = craftingSystem.getMaterialView(state);
  const categoryRows = categories.map((category) => {
    const materialRows = category.resources
      .filter((resource) => resource.amount > 0 || category.id === 'crafting_material')
      .map((resource) => `<li class="roster-row"><span>${resource.label}</span><span class="muted">Qty ${Math.floor(resource.amount)} · ${resource.tags.join(', ')}</span></li>`)
      .join('');

    return `
      <article class="defeat-card">
        <strong>${category.label}</strong>
        <p class="note">${category.description}</p>
        <ul class="roster-list">${materialRows || '<li class="roster-row">No resources tracked in this category yet.</li>'}</ul>
      </article>
    `;
  }).join('');

  return `
    <div class="grid-rows">
      ${row('Crafting Status', 'Foundations only (recipes not implemented)')}
      ${row('Known Recipes', `${state.crafting.knownRecipeIds.length} (placeholder)`)}
      ${row('Station Entries', Object.keys(state.crafting.stationLevels ?? {}).length)}
      ${row('Quality Hook', `x${hooks.qualityMultiplier.toFixed(2)}`)}
      ${row('Efficiency Hook', `x${hooks.efficiencyMultiplier.toFixed(2)}`)}
      ${row('Yield Hook', `x${hooks.yieldMultiplier.toFixed(2)}`)}
    </div>
    <h3>Resource Categories</h3>
    <div class="defeat-history">${categoryRows}</div>
    <h3>Pending Design Decisions</h3>
    <ul class="roster-list">
      <li class="roster-row"><span>Recipe schema + unlock pacing</span><span class="muted">TBD</span></li>
      <li class="roster-row"><span>Crafting station progression and queues</span><span class="muted">TBD</span></li>
      <li class="roster-row"><span>Quality tiers, failure rules, salvage outputs</span><span class="muted">TBD</span></li>
      <li class="roster-row"><span>UI flow for selecting ingredients</span><span class="muted">TBD</span></li>
    </ul>
    <p class="note">This panel intentionally exposes data hooks only so future crafting can integrate without save-schema rewrites.</p>
  `;
}

function renderEquipmentSlot(state, member, slotId) {
  const equippedId = member.equipmentSlots?.[slotId] ?? '';
  const equippedItem = equippedId ? equipmentSystem.getItemById(equippedId) : null;
  const options = equipmentSystem.getEquipOptions(state, member.instanceId, slotId, equippedId);

  const optionTags = [
    `<option value="" ${equippedId ? '' : 'selected'}>${equippedItem ? 'Unequip' : 'None'}</option>`,
    ...options.map((item) => `<option value="${item.id}" ${equippedId === item.id ? 'selected' : ''}>${item.name} (${formatStatSummary(item.stats)})</option>`)
  ].join('');

  return `
    <label class="row-label">${slotId.toUpperCase()} · ${equippedItem?.name ?? 'Empty'}</label>
    <select data-equip-instance="${member.instanceId}" data-equip-slot="${slotId}">
      ${optionTags}
    </select>
  `;
}

function formatStatSummary(stats) {
  return ['hp', 'mp', 'atk', 'def', 'mag', 'res', 'spd']
    .map((key) => `${key.toUpperCase()} ${stats[key] >= 0 ? '+' : ''}${stats[key]}`)
    .join(' ');
}

function renderCombat(state, area) {
  const areaOptions = COMBAT_AREAS.map(
    (entry) => `<option value="${entry.id}" ${entry.id === state.combat.selectedAreaId ? 'selected' : ''}>${entry.name} (Soft Cap ${entry.softCapStreak})</option>`
  ).join('');

  const chatRows = state.combat.recentResults
    .map((entry) => `<li><span class="muted">${new Date(entry.ts).toLocaleTimeString()}</span> ${entry.text}</li>`)
    .join('');

  const defeatRows = state.combat.defeatHistory
    .map((entry) => {
      const rounds = entry.rounds.map((roundText) => `<li>${roundText}</li>`).join('');
      return `<details class="defeat-card" data-defeat-key="${entry.ts}-${entry.monster.id}-${entry.streakAtDefeat}"><summary>${entry.areaName} · Streak ${entry.streakAtDefeat} · ${entry.monster.name} Lv.${entry.monster.level}</summary><div class="grid-rows">${[
        row('EXP earned this streak', entry.expEarned),
        row('Gil earned this streak', entry.gilEarned),
        row('EXP / hour', entry.expPerHour),
        row('Gil / hour', entry.gilPerHour)
      ].join('')}</div><ol class="battle-rounds">${rounds}</ol></details>`;
    })
    .join('');

  return `
    <div class="grid-rows">
      ${row('Selected Area', area.name)}
      ${row('Auto-Combat', state.combat.autoEnabled ? 'Running' : 'Paused')}
      ${row('Current Streak', state.combat.streak)}
      ${row('Total Victories', state.combat.totalVictories)}
      ${row('Reward Growth', state.combat.streak >= area.softCapStreak ? `Soft cap reached at ${area.softCapStreak} (EXP/Gil capped, monster power still rising)` : `Scaling until streak ${area.softCapStreak}`)}
      ${row('Current Monster', state.combat.currentMonster ? `${state.combat.currentMonster.name} Lv.${state.combat.currentMonster.level}` : 'Resolving...')}
    </div>
    <label class="row-label" for="combat-area-select">Combat Area</label>
    <select id="combat-area-select">${areaOptions}</select>
    <button data-combat-toggle>${state.combat.autoEnabled ? 'Pause Auto-Combat' : 'Start Auto-Combat'}</button>

    <h3>Combat Log</h3>
    <ul class="combat-log">${chatRows || '<li>No battle results yet.</li>'}</ul>

    <h3>Defeat History (last 10)</h3>
    <div class="defeat-history">${defeatRows || '<p class="note">No defeats recorded yet.</p>'}</div>
  `;
}

export function setActiveTab(tabId, ui) {
  ui.tabButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.tab === tabId);
  });

  ui.panels.forEach((panel) => {
    panel.classList.toggle('is-hidden', panel.dataset.panel !== tabId);
  });
}

export function setStatus(ui, message, isGood = false) {
  ui.statusLine.classList.toggle('good', isGood);
  ui.statusLine.textContent = message;
}
