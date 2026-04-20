import { RESOURCE_CATEGORIES, RESOURCE_CATEGORY_ORDER, RESOURCE_DEFINITIONS } from '../content/resources.js';
import { partySystem } from './partySystem.js';

const DEFAULT_CRAFTING_HOOKS = {
  qualityMultiplier: 1,
  efficiencyMultiplier: 1,
  yieldMultiplier: 1
};

export const craftingSystem = {
  getCraftingHooks(state) {
    const activeMembers = partySystem.getActiveMembers(state);
    if (!activeMembers.length) {
      return { ...DEFAULT_CRAFTING_HOOKS };
    }

    return activeMembers.reduce((hooks, member) => {
      const specialtyHooks = member.passiveSpecialtyHooks?.hooks ?? {};
      return {
        qualityMultiplier: hooks.qualityMultiplier * (specialtyHooks.craftingQuality ?? specialtyHooks.crafting ?? 1),
        efficiencyMultiplier: hooks.efficiencyMultiplier * (specialtyHooks.craftingEfficiency ?? specialtyHooks.crafting ?? 1),
        yieldMultiplier: hooks.yieldMultiplier * (specialtyHooks.craftingYield ?? specialtyHooks.crafting ?? 1)
      };
    }, { ...DEFAULT_CRAFTING_HOOKS });
  },
  getMaterialCount(state, materialId) {
    return Math.max(0, Math.floor(state.inventory?.materials?.[materialId] ?? 0));
  },
  addMaterial(state, materialId, amount) {
    const definition = RESOURCE_DEFINITIONS[materialId];
    if (!definition || definition.categoryId !== 'crafting_material') {
      return false;
    }

    const safeAmount = Math.max(0, Number(amount) || 0);
    if (safeAmount <= 0) {
      return false;
    }

    if (!state.inventory.materials[materialId]) {
      state.inventory.materials[materialId] = 0;
    }

    state.inventory.materials[materialId] += safeAmount;
    return true;
  },
  getMaterialView(state) {
    return RESOURCE_CATEGORY_ORDER.map((categoryId) => {
      const category = RESOURCE_CATEGORIES[categoryId];
      const resources = Object.values(RESOURCE_DEFINITIONS)
        .filter((resource) => resource.categoryId === categoryId)
        .map((resource) => ({
          id: resource.id,
          label: resource.label,
          amount: this.getMaterialCount(state, resource.id),
          tags: resource.tags
        }));

      return {
        id: category.id,
        label: category.label,
        description: category.description,
        resources
      };
    });
  }
};
