function row(label, value) {
  return `<div class="row"><span class="row-label">${label}</span><strong>${value}</strong></div>`;
}

function renderRoster(roster) {
  return roster
    .map(
      (unit) =>
        `<div class="row"><span>${unit.name}</span><strong>${unit.tier} • ${unit.role} • ${unit.element}</strong></div>`
    )
    .join('');
}

export function render(state, ui) {
  ui.currencyStrip.innerHTML = [
    `<span class="currency-pill">Gil: ${Math.floor(state.currencies.gil)}</span>`,
    `<span class="currency-pill">Crystal Shards: ${Math.floor(state.currencies.crystalShards)}</span>`
  ].join('');

  ui.overviewContent.innerHTML = `<div class="grid-rows">${[
    row('Save Version', state.meta.version),
    row('Autosaves', state.runtime.autosaveCount),
    row('Last Offline Window', `${Math.floor(state.runtime.lastOfflineDurationMs / 1000)}s`),
    row('Current Zone', state.combat.zone),
    row('Party Size', state.party.roster.length)
  ].join('')}</div>`;

  ui.partyContent.innerHTML = `<div class="grid-rows">${renderRoster(state.party.roster)}</div>`;

  ui.recruitContent.innerHTML = `<div class="grid-rows">${[
    row('Shard Cost / Pull', state.recruit.shardCostPerPull),
    row('Seeded Pool Size', state.recruit.pool.length)
  ].join('')}</div><p class="note">Recruit flow is intentionally scaffold-only in this milestone.</p>`;

  ui.passiveContent.innerHTML = `<div class="grid-rows">${[
    row('Status', state.passive.status),
    row('Hook', state.passive.notes)
  ].join('')}</div>`;

  ui.combatContent.innerHTML = `<div class="grid-rows">${[
    row('Zone', state.combat.zone),
    row('Status', state.combat.status),
    row('Hook', state.combat.notes)
  ].join('')}</div>`;

  ui.questsContent.innerHTML = `<div class="grid-rows">${state.quests.entries
    .map((quest) => row(quest.title, `${quest.status} • ${quest.objective}`))
    .join('')}</div>`;

  ui.inventoryContent.innerHTML = `<div class="grid-rows">${state.inventory.materials
    .map((item) => row(item.name, `x${item.qty}`))
    .join('')}</div><p class="note">Crafting hooks reserved; no production rules shipped yet.</p>`;

  setActiveTab(state.ui.activeTab, ui);
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
