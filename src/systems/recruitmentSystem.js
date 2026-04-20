import { CHARACTERS_BY_ID, CHARACTER_CONTENT, STARTER_CHARACTER_ID } from '../content/characters.js';
import { TIER_ORDER } from '../content/characterTiers.js';
import { RECRUITMENT_BALANCE, TIER_PROBABILITIES } from '../content/recruitmentBalance.js';
import { nextRandomFloat, pickOne, pickWeighted } from '../core/random.js';

const CHARACTERS_BY_TIER = TIER_ORDER.reduce((acc, tierId) => {
  acc[tierId] = CHARACTER_CONTENT.filter((character) => character.tierId === tierId);
  return acc;
}, {});

export const recruitmentSystem = {
  id: 'recruitment',
  update() {
    return false;
  },
  initializeStarter(state) {
    if (state.roster.ownedInstanceIds.length > 0) {
      return false;
    }

    const starterInstanceId = this.addCharacterInstance(state, STARTER_CHARACTER_ID);
    state.party.activeInstanceIds[0] = starterInstanceId;
    return true;
  },
  canPull(state) {
    return state.economy.shards >= RECRUITMENT_BALANCE.shardCostPerPull;
  },
  performPull(state) {
    if (!this.canPull(state)) {
      return { ok: false, reason: 'Not enough Crystal Shards.' };
    }

    state.economy.shards -= RECRUITMENT_BALANCE.shardCostPerPull;

    const tierPick = pickWeighted(
      TIER_ORDER.map((tierId) => ({ tierId, weight: RECRUITMENT_BALANCE.tierWeights[tierId] })),
      nextRandomFloat(state)
    );

    const tierRoster = CHARACTERS_BY_TIER[tierPick.tierId] ?? [];
    const character = pickOne(tierRoster, nextRandomFloat(state));

    if (!character) {
      return { ok: false, reason: 'No recruit available for rolled tier.' };
    }

    const instanceId = this.addCharacterInstance(state, character.id);
    const result = {
      ok: true,
      instanceId,
      characterId: character.id,
      name: character.name,
      tierId: character.tierId,
      passiveSpecialty: character.passiveSpecialty
    };

    state.gacha.lastPullResult = result;
    return result;
  },
  addCharacterInstance(state, characterId) {
    if (!CHARACTERS_BY_ID[characterId]) {
      throw new Error(`Unknown character id: ${characterId}`);
    }

    const instanceId = `inst_${String(state.roster.nextInstanceId).padStart(4, '0')}`;
    state.roster.nextInstanceId += 1;
    state.roster.ownedInstanceIds.push(instanceId);
    state.roster.byInstanceId[instanceId] = {
      instanceId,
      characterId,
      level: 1,
      exp: 0,
      awakenRank: 0,
      equipmentSlots: {
        weapon: null,
        armor: null,
        accessory: null
      }
    };

    return instanceId;
  },
  getTierProbabilities() {
    return TIER_PROBABILITIES;
  }
};
