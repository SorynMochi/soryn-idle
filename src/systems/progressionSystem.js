import { characterXpToNextLevel, xpToNextLevel } from '../core/gameState.js';

export const progressionSystem = {
  id: 'progression',
  update(state) {
    let changed = false;

    while (state.hero.xp >= state.hero.xpToNext) {
      state.hero.xp -= state.hero.xpToNext;
      state.hero.level += 1;
      state.hero.attack += 2;
      state.hero.maxHp += 8;
      state.hero.hp = state.hero.maxHp;
      state.hero.xpToNext = xpToNextLevel(state.hero.level);
      changed = true;
    }

    for (const instanceId of state.roster.ownedInstanceIds) {
      const instance = state.roster.byInstanceId?.[instanceId];
      if (!instance) {
        continue;
      }

      instance.level = Number.isFinite(instance.level) ? Math.max(1, Math.floor(instance.level)) : 1;
      instance.exp = Number.isFinite(instance.exp) ? Math.max(0, instance.exp) : 0;
      instance.expToNext = Number.isFinite(instance.expToNext)
        ? Math.max(1, Math.floor(instance.expToNext))
        : characterXpToNextLevel(instance.level);

      while (instance.exp >= instance.expToNext) {
        instance.exp -= instance.expToNext;
        instance.level += 1;
        instance.expToNext = characterXpToNextLevel(instance.level);
        changed = true;
      }
    }

    return changed;
  }
};
