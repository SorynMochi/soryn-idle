function row(label, value) {
  return `<div class="row"><span class="row-label">${label}</span><strong>${value}</strong></div>`;
}

function renderRoster(roster) {
  return roster
    .map(
      (unit) =>
        `<div class="row"><span>${unit.name}</span><strong>${unit.tier} • ${unit.role} • ${unit.element}</strong></div>`
    )
import { CHARACTER_TIERS } from '../content/characterTiers.js';
import { RECRUITMENT_BALANCE } from '../content/recruitmentBalance.js';
import { partySystem } from '../systems/partySystem.js';
import { passiveSystem } from '../systems/passiveSystem.js';
import { recruitmentSystem } from '../systems/recruitmentSystem.js';

function renderRows(entries) {
  return entries
    .map(([label, value]) => `<div class="stat-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join('');
}

function toPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function memberLabel(member) {
  const tier = CHARACTER_TIERS[member.tierId];
  return `${member.name} · ${tier.label}`;
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
  const activeMembers = partySystem.getActiveMembers(state);
  const benchMembers = partySystem.getBenchMembers(state);
  const totals = partySystem.getPartyTotals(state);

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

  ui.recruitStats.innerHTML = renderRows([
    ['Crystal Shards', state.economy.shards],
    ['Pull Cost', RECRUITMENT_BALANCE.shardCostPerPull],
    ['Owned Units', state.roster.ownedInstanceIds.length]
  ]);

  ui.recruitResult.innerHTML = state.gacha.lastPullResult
    ? `<p><strong>${state.gacha.lastPullResult.name}</strong> (${CHARACTER_TIERS[state.gacha.lastPullResult.tierId].label}) joined.<br/>Passive: ${state.gacha.lastPullResult.passiveSpecialty.name}</p>`
    : '<p>No recruitment yet.</p>';

  ui.recruitRates.innerHTML = recruitmentSystem
    .getTierProbabilities()
    .map((entry) => {
      const tier = CHARACTER_TIERS[entry.tierId];
      return `<div class="stat-row"><span>${tier.label}</span><strong>${toPercent(entry.probability)}</strong></div>`;
    })
    .join('');

  const passiveCategories = passiveSystem.buildCategoryView(state);
  const totalPassiveResources = Object.values(state.passive.resources).reduce((total, value) => total + value, 0);

  ui.passiveStats.innerHTML = renderRows([
    ['Selected', state.passive.selectedCategoryId],
    ['Total Stockpile', Math.floor(totalPassiveResources)],
    ['Aether Ore', Math.floor(state.passive.resources.ore)],
    ['Moonwood Timber', Math.floor(state.passive.resources.timber)],
    ['Starbloom Herbs', Math.floor(state.passive.resources.herbs)],
    ['Arcane Insight', Math.floor(state.passive.resources.insight)],
    ['Battle Mastery', Math.floor(state.passive.resources.mastery)]
  ]);

  ui.passiveCategories.innerHTML = passiveCategories
    .map((category) => {
      if (!category.unlocked) {
        return `<li class="roster-row passive-row"><div><strong>${category.label}</strong><div class="muted">${category.description}</div><div class="muted">Unlock Cost: ${category.unlockCostGold}g</div></div><button data-passive-action="unlock" data-category="${category.id}">Unlock</button></li>`;
      }

      const buttonRow = category.selected
        ? '<span class="muted">Active</span>'
        : `<button data-passive-action="select" data-category="${category.id}">Set Active</button>`;

      const upgradeButton = category.nextUpgrade
        ? `<button data-passive-action="upgrade" data-category="${category.id}">Upgrade (${category.nextUpgrade.costGold}g)</button>`
        : '<span class="muted">Maxed</span>';

      const bonusText = category.specialtyMultiplier > 1 ? `Specialty Bonus: x${category.specialtyMultiplier.toFixed(2)}` : 'Specialty Bonus: none';
      const benefitRows = [
        `<div class=\"muted\">${category.resourceLabel}: ${category.output.resourcePerSecond.toFixed(2)}/s</div>`,
        category.output.heroXpPerSecond > 0 ? `<div class=\"muted\">Hero XP: ${category.output.heroXpPerSecond.toFixed(2)}/s</div>` : '',
        category.output.heroAttackPerSecond > 0 ? `<div class=\"muted\">Hero ATK: ${category.output.heroAttackPerSecond.toFixed(3)}/s</div>` : ''
      ].join('');

      return `<li class="roster-row passive-row"><div><strong>${category.label} · Lv ${category.upgradeLevel}</strong>${benefitRows}<div class="muted">${bonusText}</div><div class="muted">Total Generated: ${Math.floor(category.totalGenerated)}</div><div class="muted">${category.description}</div></div><div class="button-stack">${buttonRow}${upgradeButton}</div></li>`;
    })
    .join('');

  ui.partyTotals.innerHTML = renderRows([
    ['Active Members', `${activeMembers.length} / ${state.party.maxSlots}`],
    ['Party HP', totals.hp],
    ['Party MP', totals.mp],
    ['ATK', totals.atk],
    ['DEF', totals.def],
    ['MAG', totals.mag],
    ['RES', totals.res],
    ['SPD', totals.spd]
  ]);

  ui.partyActive.innerHTML = state.party.activeInstanceIds
    .map((instanceId, index) => {
      if (!instanceId) {
        return `<li class="roster-row"><span>Slot ${index + 1}: Empty</span></li>`;
      }

      const member = activeMembers.find((entry) => entry.instanceId === instanceId);
      if (!member) {
        return `<li class="roster-row"><span>Slot ${index + 1}: Unknown</span></li>`;
      }

      return `<li class="roster-row"><span>Slot ${index + 1}: ${memberLabel(member)}</span><button data-action="remove" data-slot="${index}">Remove</button></li>`;
    })
    .join('');

  ui.partyBench.innerHTML = benchMembers.length
    ? benchMembers
        .map((member) => {
          const availableSlots = state.party.activeInstanceIds
            .map((instanceId, slotIndex) => ({ instanceId, slotIndex }))
            .filter((entry) => !entry.instanceId);

          const assignButtons = availableSlots.length
            ? availableSlots
                .map(
                  (slot) =>
                    `<button data-action="assign" data-instance-id="${member.instanceId}" data-slot="${slot.slotIndex}">Assign Slot ${slot.slotIndex + 1}</button>`
                )
                .join('')
            : '<span class="muted">Party full</span>';

          return `<li class="roster-row"><div><strong>${memberLabel(member)}</strong><div class="muted">Passive: ${member.passiveSpecialty.name}</div></div><div class="button-stack">${assignButtons}</div></li>`;
        })
        .join('')
    : '<li class="roster-row"><span>No bench members yet.</span></li>';
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
