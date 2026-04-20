export const PASSIVE_SPECIALTY_HOOKS = {
  stonewall: {
    categoryId: 'mining',
    yieldMultiplier: 1.08,
    hooks: { crafting: 1.02, questRewards: 1.04, combatExp: 1, itemDropChance: 1.01 }
  },
  mending_hymn: {
    categoryId: 'gathering',
    yieldMultiplier: 1.12,
    hooks: { crafting: 1.04, questRewards: 1.03, combatExp: 1.01, itemDropChance: 1.02 }
  },
  chase_step: {
    categoryId: 'training',
    yieldMultiplier: 1.1,
    hooks: { crafting: 1, questRewards: 1.02, combatExp: 1.05, itemDropChance: 1.03 }
  },
  aether_flow: {
    categoryId: 'studying',
    yieldMultiplier: 1.12,
    hooks: { crafting: 1.05, questRewards: 1.02, combatExp: 1.03, itemDropChance: 1.01 }
  },
  lionheart_oath: {
    categoryId: 'training',
    yieldMultiplier: 1.14,
    hooks: { crafting: 1.01, questRewards: 1.05, combatExp: 1.04, itemDropChance: 1.01 }
  },
  starlit_arc: {
    categoryId: 'studying',
    yieldMultiplier: 1.15,
    hooks: { crafting: 1.06, questRewards: 1.04, combatExp: 1.03, itemDropChance: 1.02 }
  },
  war_cry: {
    categoryId: 'chopping',
    yieldMultiplier: 1.12,
    hooks: { crafting: 1.02, questRewards: 1.04, combatExp: 1.06, itemDropChance: 1.01 }
  },
  astral_veil: {
    categoryId: 'gathering',
    yieldMultiplier: 1.1,
    hooks: { crafting: 1.03, questRewards: 1.03, combatExp: 1.02, itemDropChance: 1.03 }
  },
  sunfall_edict: {
    categoryId: 'mining',
    yieldMultiplier: 1.2,
    hooks: { crafting: 1.06, questRewards: 1.06, combatExp: 1.06, itemDropChance: 1.04 }
  }
};

export function getSpecialtyHookById(specialtyId) {
  if (!specialtyId || !PASSIVE_SPECIALTY_HOOKS[specialtyId]) {
    return {
      categoryId: null,
      yieldMultiplier: 1,
      hooks: { crafting: 1, questRewards: 1, combatExp: 1, itemDropChance: 1 }
    };
  }

  return PASSIVE_SPECIALTY_HOOKS[specialtyId];
}
