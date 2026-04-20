import { COMBAT_AREAS, COMBAT_AREAS_BY_ID } from '../content/combatAreas.js';
import { partySystem } from '../systems/partySystem.js';

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
    row('Combat Tick', `${state.combat.tickMs / 1000}s`),
    row('Autosaves', state.runtime.autosaveCount)
  ].join('')}</div>`;

  ui.partyContent.innerHTML = `<div class="grid-rows">${[
    row('Active Party Size', `${activeMembers.length} / ${state.party.maxSlots}`),
    row('Combined HP', partyTotals.hp),
    row('Combined ATK', partyTotals.atk),
    row('Combined DEF', partyTotals.def),
    row('Combined SPD', partyTotals.spd)
  ].join('')}</div><ul class="roster-list">${activeMembers
    .map((member) => `<li class="roster-row"><span>${member.name}</span><span class="muted">ATK ${member.baseStats.atk} · DEF ${member.baseStats.def} · SPD ${member.baseStats.spd}</span></li>`)
    .join('') || '<li class="roster-row">No active members assigned.</li>'}</ul>`;

  ui.recruitContent.innerHTML = '<p class="note">Recruitment UI is pending. Seeded characters are active for combat tuning.</p>';

  ui.passiveContent.innerHTML = `<div class="grid-rows">${[
    row('Active Passive Route', state.passive.selectedCategoryId),
    row('Aether Ore', Math.floor(state.passive.resources.ore)),
    row('Moonwood Timber', Math.floor(state.passive.resources.timber)),
    row('Starbloom Herbs', Math.floor(state.passive.resources.herbs))
  ].join('')}</div><p class="note">Passive generation runs continuously alongside combat.</p>`;

  ui.combatContent.innerHTML = renderCombat(state, selectedArea);

  ui.questsContent.innerHTML = '<p class="note">Quest integration is planned after combat and passive loops stabilize.</p>';
  ui.inventoryContent.innerHTML = '<p class="note">Inventory and crafting hooks are scaffolded for future milestones.</p>';

  setActiveTab(state.ui.activeTab, ui);
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
      return `<details class="defeat-card"><summary>${entry.areaName} · Streak ${entry.streakAtDefeat} · ${entry.monster.name} Lv.${entry.monster.level}</summary><div class="grid-rows">${[
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
      ${row('Current Streak', state.combat.streak)}
      ${row('Total Victories', state.combat.totalVictories)}
      ${row('Reward Growth', state.combat.streak >= area.softCapStreak ? 'Soft cap reached (rewards capped)' : `Scaling until streak ${area.softCapStreak}`)}
      ${row('Current Monster', state.combat.currentMonster ? `${state.combat.currentMonster.name} Lv.${state.combat.currentMonster.level}` : 'Resolving...')}
    </div>
    <label class="row-label" for="combat-area-select">Combat Area</label>
    <select id="combat-area-select">${areaOptions}</select>

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
