import { xpToNextLevel } from '../core/gameState.js';

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

    return changed;
  }
};
