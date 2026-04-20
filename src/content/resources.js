export const RESOURCE_CATEGORIES = {
  crafting_material: {
    id: 'crafting_material',
    label: 'Crafting Materials',
    description: 'Physical components that can feed future recipe costs.'
  },
  knowledge: {
    id: 'knowledge',
    label: 'Knowledge',
    description: 'Progression resources reserved for upgrades and research gates.'
  },
  combat_spoil: {
    id: 'combat_spoil',
    label: 'Combat Spoils',
    description: 'Drops from encounters and dispatches, reserved for future systems.'
  }
};

export const RESOURCE_CATEGORY_ORDER = ['crafting_material', 'knowledge', 'combat_spoil'];

export const RESOURCE_DEFINITIONS = {
  ore: { id: 'ore', label: 'Aether Ore', categoryId: 'crafting_material', tags: ['mined', 'metal'] },
  timber: { id: 'timber', label: 'Moonwood Timber', categoryId: 'crafting_material', tags: ['harvested', 'wood'] },
  herbs: { id: 'herbs', label: 'Starbloom Herbs', categoryId: 'crafting_material', tags: ['harvested', 'reagent'] },
  insight: { id: 'insight', label: 'Arcane Insight', categoryId: 'knowledge', tags: ['scholarship'] },
  mastery: { id: 'mastery', label: 'Battle Mastery', categoryId: 'knowledge', tags: ['training'] }
};

export const RESOURCE_IDS = Object.keys(RESOURCE_DEFINITIONS);

export const CRAFTING_MATERIAL_IDS = RESOURCE_IDS.filter(
  (resourceId) => RESOURCE_DEFINITIONS[resourceId].categoryId === 'crafting_material'
);

export const INITIAL_INVENTORY_MATERIALS = Object.fromEntries(
  CRAFTING_MATERIAL_IDS.map((resourceId) => [resourceId, 0])
);
