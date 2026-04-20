import { TIER_ORDER } from './characterTiers.js';

export const RECRUITMENT_BALANCE = {
  shardCostPerPull: 10,
  starterPullCount: 3,
  tierWeights: {
    common: 55,
    uncommon: 25,
    rare: 13,
    epic: 6,
    legendary: 1
  }
};

export const INITIAL_SHARDS = RECRUITMENT_BALANCE.shardCostPerPull * RECRUITMENT_BALANCE.starterPullCount;

export const TIER_PROBABILITIES = TIER_ORDER.map((tierId) => {
  const totalWeight = TIER_ORDER.reduce((sum, key) => sum + RECRUITMENT_BALANCE.tierWeights[key], 0);
  return {
    tierId,
    weight: RECRUITMENT_BALANCE.tierWeights[tierId],
    probability: RECRUITMENT_BALANCE.tierWeights[tierId] / totalWeight
  };
});
