function renderRows(entries) {
  return entries
    .map(([label, value]) => `<div class="stat-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');
}

export function render(state, ui) {
  ui.heroStats.innerHTML = renderRows([
    ['Level', state.hero.level],
    ['HP', `${Math.floor(state.hero.hp)} / ${state.hero.maxHp}`],
    ['Attack', state.hero.attack],
    ['XP', `${Math.floor(state.hero.xp)} / ${state.hero.xpToNext}`]
  ]);

  ui.worldStats.innerHTML = renderRows([
    ['Zone', state.world.zone],
    ['Kills', state.world.kills],
    ['Enemy', state.world.enemy.name],
    ['Enemy HP', `${Math.max(0, Math.floor(state.world.enemy.hp))} / ${state.world.enemy.maxHp}`]
  ]);

  ui.economyStats.innerHTML = renderRows([
    ['Gold', Math.floor(state.economy.gold)],
    ['Shards', state.economy.shards],
    ['Ticks', state.runtime.totalTicks]
  ]);

  ui.upgradeStats.innerHTML = renderRows([
    ['Attack Rank', state.upgrades.attackRank],
    ['Vitality Rank', state.upgrades.vitalityRank],
    ['Automation Rank', state.upgrades.automationRank]
  ]);
}

export function setStatus(ui, text) {
  ui.status.textContent = text;
}

export function setOfflineSummary(ui, text) {
  ui.offlineSummary.textContent = text;
}
