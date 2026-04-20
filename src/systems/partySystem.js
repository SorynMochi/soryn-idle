import { CHARACTERS_BY_ID } from '../content/characters.js';

const MAIN_STATS = ['atk', 'def', 'mag', 'res', 'spd'];

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
    if (!instance) {
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
      .filter(Boolean);
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
      totals.hp += member.baseStats.hp;
      totals.mp += member.baseStats.mp;

      for (const stat of MAIN_STATS) {
        totals[stat] += member.baseStats[stat];
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

      seen.add(instanceId);
      return instanceId;
    });

    while (party.activeInstanceIds.length < party.maxSlots) {
      party.activeInstanceIds.push(null);
    }
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

  return {
    instanceId,
    characterId: instance.characterId,
    name: character.name,
    tierId: character.tierId,
    baseStats: character.baseStats,
    passiveSpecialty: character.passiveSpecialty,
    equipmentHook: character.equipmentHook
  };
}
