import { PASSIVE_ACTION_CATEGORIES, PASSIVE_CATEGORY_ORDER } from '../content/passiveActions.js';
import { PASSIVE_SPECIALTY_HOOKS } from '../content/passiveSpecialtyHooks.js';
import { partySystem } from './partySystem.js';

export const passiveSystem = {
  id: 'passive',
  update(state, _ctx, deltaMs) {
    const categoryId = state.passive.selectedCategoryId;
    const categoryState = state.passive.categories[categoryId];
    const category = PASSIVE_ACTION_CATEGORIES[categoryId];

    if (!category || !categoryState?.unlocked) {
      return false;
    }

    const deltaSec = deltaMs / 1000;
    const output = this.getOutputPerSecond(state, categoryId);
    const generatedAmount = output.resourcePerSecond * deltaSec;

    if (generatedAmount <= 0) {
      return false;
    }

    state.passive.resources[category.resourceKey] += generatedAmount;
    categoryState.totalGenerated += generatedAmount;
    categoryState.elapsedMs += deltaMs;

    if (output.heroXpPerSecond > 0) {
      state.hero.xp += output.heroXpPerSecond * deltaSec;
    }

    if (output.heroAttackPerSecond > 0) {
      state.hero.attack += output.heroAttackPerSecond * deltaSec;
    }

    return true;
  },
  selectCategory(state, categoryId) {
    const categoryState = state.passive.categories[categoryId];
    if (!categoryState?.unlocked) {
      return false;
    }

    state.passive.selectedCategoryId = categoryId;
    return true;
  },
  tryUnlockCategory(state, categoryId) {
    const category = PASSIVE_ACTION_CATEGORIES[categoryId];
    const categoryState = state.passive.categories[categoryId];

    if (!category || !categoryState || categoryState.unlocked) {
      return false;
    }

    if (state.economy.gold < category.unlockCostGold) {
      return false;
    }

    state.economy.gold -= category.unlockCostGold;
    categoryState.unlocked = true;

    if (!state.passive.selectedCategoryId) {
      state.passive.selectedCategoryId = categoryId;
    }

    return true;
  },
  tryUpgradeCategory(state, categoryId) {
    const category = PASSIVE_ACTION_CATEGORIES[categoryId];
    const categoryState = state.passive.categories[categoryId];

    if (!category || !categoryState?.unlocked) {
      return false;
    }

    const nextUpgrade = category.upgrades[categoryState.upgradeLevel] ?? null;
    if (!nextUpgrade || state.economy.gold < nextUpgrade.costGold) {
      return false;
    }

    state.economy.gold -= nextUpgrade.costGold;
    categoryState.upgradeLevel += 1;
    return true;
  },
  getOutputPerSecond(state, categoryId) {
    const category = PASSIVE_ACTION_CATEGORIES[categoryId];
    const categoryState = state.passive.categories[categoryId];

    if (!category || !categoryState?.unlocked) {
      return { resourcePerSecond: 0, heroXpPerSecond: 0, heroAttackPerSecond: 0 };
    }

    const base = category.baseYieldPerSecond;
    const upgrade = category.upgrades[categoryState.upgradeLevel - 1] ?? null;

    const upgradeYieldMultiplier = upgrade?.yieldMultiplier ?? 1;
    const specialtyMultiplier = this.getSpecialtyMultiplier(state, categoryId);

    const resourcePerSecond = base * upgradeYieldMultiplier * specialtyMultiplier;
    const heroXpPerSecond = (category.heroXpPerSecond ?? 0) * (upgrade?.xpMultiplier ?? 1) * specialtyMultiplier;
    const heroAttackPerSecond = (category.heroAttackPerSecond ?? 0) * (upgrade?.attackMultiplier ?? 1) * specialtyMultiplier;

    return { resourcePerSecond, heroXpPerSecond, heroAttackPerSecond };
  },
  getSpecialtyMultiplier(state, categoryId) {
    const activeMembers = partySystem.getActiveMembers(state);
    if (!activeMembers.length) {
      return 1;
    }

    return activeMembers.reduce((multiplier, member) => {
      const specialtyId = member.passiveSpecialty?.id;
      if (!specialtyId) {
        return multiplier;
      }

      const hook = PASSIVE_SPECIALTY_HOOKS[specialtyId];
      if (!hook || hook.categoryId !== categoryId) {
        return multiplier;
      }

      return multiplier * hook.yieldMultiplier;
    }, 1);
  },
  buildCategoryView(state) {
    return PASSIVE_CATEGORY_ORDER.map((categoryId) => {
      const category = PASSIVE_ACTION_CATEGORIES[categoryId];
      const categoryState = state.passive.categories[categoryId];
      const output = this.getOutputPerSecond(state, categoryId);
      const specialtyMultiplier = this.getSpecialtyMultiplier(state, categoryId);
      const nextUpgrade = category.upgrades[categoryState.upgradeLevel] ?? null;

      return {
        id: category.id,
        label: category.label,
        description: category.description,
        resourceLabel: category.resourceLabel,
        resourceKey: category.resourceKey,
        unlocked: categoryState.unlocked,
        unlockCostGold: category.unlockCostGold,
        selected: state.passive.selectedCategoryId === categoryId,
        upgradeLevel: categoryState.upgradeLevel,
        maxUpgradeLevel: category.upgrades.length,
        nextUpgrade,
        totalGenerated: categoryState.totalGenerated,
        elapsedMs: categoryState.elapsedMs,
        output,
        specialtyMultiplier
      };
    });
  }
};
