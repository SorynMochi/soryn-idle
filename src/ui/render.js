import { CHARACTER_TIERS } from '../content/characterTiers.js';
import { RECRUITMENT_BALANCE } from '../content/recruitmentBalance.js';
import { partySystem } from '../systems/partySystem.js';
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

export function setStatus(ui, text) {
  ui.status.textContent = text;
}

export function setOfflineSummary(ui, text) {
  ui.offlineSummary.textContent = text;
}
