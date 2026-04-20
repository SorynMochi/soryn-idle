export const PASSIVE_ACTION_CATEGORIES = {
  mining: {
    id: 'mining',
    label: 'Mining',
    description: 'Excavate crystal-veined stone for forge-grade ore.',
    resourceKey: 'ore',
    resourceLabel: 'Aether Ore',
    unlockCostGold: 0,
    baseYieldPerSecond: 0.9,
    upgrades: [
      { level: 1, costGold: 45, yieldMultiplier: 1.35, name: 'Bronze Picks' },
      { level: 2, costGold: 120, yieldMultiplier: 1.75, name: 'Resonance Blasting' },
      { level: 3, costGold: 260, yieldMultiplier: 2.3, name: 'Mythril Drills' }
    ]
  },
  chopping: {
    id: 'chopping',
    label: 'Chopping',
    description: 'Harvest ancient timber for future crafting lines.',
    resourceKey: 'timber',
    resourceLabel: 'Moonwood Timber',
    unlockCostGold: 60,
    baseYieldPerSecond: 0.75,
    upgrades: [
      { level: 1, costGold: 60, yieldMultiplier: 1.4, name: 'Field Axes' },
      { level: 2, costGold: 145, yieldMultiplier: 1.85, name: 'Split Rhythm' },
      { level: 3, costGold: 300, yieldMultiplier: 2.45, name: 'Stormwood Saws' }
    ]
  },
  gathering: {
    id: 'gathering',
    label: 'Gathering',
    description: 'Collect reagents and provisions from the wild frontier.',
    resourceKey: 'herbs',
    resourceLabel: 'Starbloom Herbs',
    unlockCostGold: 80,
    baseYieldPerSecond: 0.72,
    upgrades: [
      { level: 1, costGold: 70, yieldMultiplier: 1.35, name: 'Survey Satchels' },
      { level: 2, costGold: 170, yieldMultiplier: 1.9, name: 'Guided Routes' },
      { level: 3, costGold: 335, yieldMultiplier: 2.55, name: 'Warden Caravan' }
    ]
  },
  studying: {
    id: 'studying',
    label: 'Studying',
    description: 'Research tomes to archive battle doctrine and spell theory.',
    resourceKey: 'insight',
    resourceLabel: 'Arcane Insight',
    unlockCostGold: 90,
    baseYieldPerSecond: 0.45,
    heroXpPerSecond: 0.16,
    upgrades: [
      { level: 1, costGold: 85, yieldMultiplier: 1.4, xpMultiplier: 1.35, name: 'Academy Notes' },
      { level: 2, costGold: 190, yieldMultiplier: 1.9, xpMultiplier: 1.75, name: 'Cipher Codices' },
      { level: 3, costGold: 360, yieldMultiplier: 2.5, xpMultiplier: 2.25, name: 'Astral Thesis' }
    ]
  },
  training: {
    id: 'training',
    label: 'Training',
    description: 'Refine form and discipline to stockpile martial mastery.',
    resourceKey: 'mastery',
    resourceLabel: 'Battle Mastery',
    unlockCostGold: 110,
    baseYieldPerSecond: 0.5,
    heroAttackPerSecond: 0.02,
    upgrades: [
      { level: 1, costGold: 95, yieldMultiplier: 1.4, attackMultiplier: 1.4, name: 'Drill Cadence' },
      { level: 2, costGold: 210, yieldMultiplier: 2.0, attackMultiplier: 1.9, name: 'Veteran Forms' },
      { level: 3, costGold: 390, yieldMultiplier: 2.7, attackMultiplier: 2.5, name: 'Grandmaster Regimen' }
    ]
  }
};

export const PASSIVE_CATEGORY_ORDER = ['mining', 'chopping', 'gathering', 'studying', 'training'];

export const PASSIVE_RESOURCE_KEYS = ['ore', 'timber', 'herbs', 'insight', 'mastery'];
