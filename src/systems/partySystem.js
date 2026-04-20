import { CHARACTERS_BY_ID } from '../content/characters.js';
import { getSpecialtyHookById } from '../content/passiveSpecialtyHooks.js';
import { equipmentSystem } from './equipmentSystem.js';

const MAIN_STATS = equipmentSystem.getStatKeys();

export const partySystem = {
  id: 'party',
  update() {
    return false;
  },
  assign(state, instanceId, slotIndex) {
    const party = state.party;
    if (!party || slotIndex < 0 || slotIndex >= party.maxSlots) {
      return false;
    }

    const instance = state.roster.byInstanceId[instanceId];
    if (!instance || instance.lockState?.locked) {
      return false;
    }

    if (party.activeInstanceIds.includes(instanceId)) {
      return false;
    }

    party.activeInstanceIds[slotIndex] = instanceId;
    return true;
  },
  remove(state, slotIndex) {
    const party = state.party;
    if (!party || slotIndex < 0 || slotIndex >= party.maxSlots) {
      return false;
    }

    if (!party.activeInstanceIds[slotIndex]) {
      return false;
    }

    party.activeInstanceIds[slotIndex] = null;
    return true;
  },
  getActiveMembers(state) {
    return state.party.activeInstanceIds
      .filter(Boolean)
      .map((instanceId) => getRosterView(state, instanceId))
      .filter((member) => member && !member.lockState?.locked);
  },
  getBenchMembers(state) {
    const active = new Set(state.party.activeInstanceIds.filter(Boolean));
    return state.roster.ownedInstanceIds
      .filter((instanceId) => !active.has(instanceId))
      .map((instanceId) => getRosterView(state, instanceId))
      .filter(Boolean);
  },
  getPartyTotals(state) {
    const totals = { hp: 0, mp: 0, atk: 0, def: 0, mag: 0, res: 0, spd: 0 };

    for (const member of this.getActiveMembers(state)) {
      for (const stat of MAIN_STATS) {
        totals[stat] += member.finalStats[stat];
      }
    }

    return totals;
  },
  normalize(state) {
    const party = state.party;
    if (!party) {
      return;
    }

    const seen = new Set();
    party.activeInstanceIds = party.activeInstanceIds.slice(0, party.maxSlots).map((instanceId) => {
      if (!instanceId || !state.roster.byInstanceId[instanceId] || seen.has(instanceId)) {
        return null;
      }

      const instance = state.roster.byInstanceId[instanceId];
      if (instance.lockState?.locked) {
        return null;
      }

      seen.add(instanceId);
      return instanceId;
    });

    while (party.activeInstanceIds.length < party.maxSlots) {
      party.activeInstanceIds.push(null);
    }
  },
  getRosterView(state, instanceId) {
    return getRosterView(state, instanceId);
  }
};

function getRosterView(state, instanceId) {
  const instance = state.roster.byInstanceId[instanceId];
  if (!instance) {
    return null;
  }

  const character = CHARACTERS_BY_ID[instance.characterId];
  if (!character) {
    return null;
  }

  const equipmentBonuses = equipmentSystem.getEquipmentBonus(state, instanceId);
  const level = Number.isFinite(instance.level) ? Math.max(1, Math.floor(instance.level)) : 1;
  const exp = Number.isFinite(instance.exp) ? Math.max(0, instance.exp) : 0;
  const expToNext = Number.isFinite(instance.expToNext) ? Math.max(1, Math.floor(instance.expToNext)) : 1;
  const scaledBaseStats = scaleStatsForLevel(character.baseStats, level);

  return {
    instanceId,
    characterId: instance.characterId,
    name: character.name,
    tierId: character.tierId,
    level,
    exp,
    expToNext,
    baseStats: scaledBaseStats,
    equipmentSlots: instance.equipmentSlots,
    equipmentBonuses,
    finalStats: equipmentSystem.getFinalStats(scaledBaseStats, equipmentBonuses),
    passiveSpecialty: character.passiveSpecialty,
    passiveSpecialtyHooks: getSpecialtyHookById(character.passiveSpecialty?.id),
    equipmentHook: character.equipmentHook,
    lockState: instance.lockState ?? null
  };
}

function scaleStatsForLevel(baseStats, level) {
  const growth = {
    hp: 0.065,
    mp: 0.05,
    atk: 0.04,
    def: 0.035,
    mag: 0.04,
    res: 0.035,
    spd: 0.02
  };
  const levelOffset = Math.max(0, level - 1);

  return Object.fromEntries(
    MAIN_STATS.map((stat) => {
      const baseValue = Number(baseStats?.[stat] ?? 0);
      const perLevelGrowth = growth[stat] ?? 0.03;
      const value = Math.floor(baseValue * (1 + perLevelGrowth * levelOffset));
      return [stat, Math.max(1, value)];
    })
  );
}
