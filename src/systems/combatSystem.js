import { buildEnemyForZone } from '../core/gameState.js';

export const combatSystem = {
  id: 'combat',
  update(state, ctx, deltaMs) {
    const stepSec = deltaMs / 1000;
    const heroDps = state.hero.attack * (1 + state.upgrades.automationRank * 0.1);
    const enemyDps = Math.max(0, state.world.enemy.attack * 0.8);

    state.world.enemy.hp -= heroDps * stepSec;
    state.hero.hp -= enemyDps * stepSec;

    let changed = true;

    if (state.hero.hp <= 0) {
      state.hero.hp = state.hero.maxHp;
      state.world.enemy = buildEnemyForZone(state.world.zone);
      ctx.events.push('You were defeated and recovered.');
      return changed;
    }

    if (state.world.enemy.hp <= 0) {
      state.economy.gold += state.world.enemy.rewardGold;
      state.hero.xp += state.world.enemy.rewardXp;
      state.world.kills += 1;

      if (state.world.kills % 10 === 0) {
        state.world.zone += 1;
        ctx.events.push(`Advanced to zone ${state.world.zone}.`);
      }

      state.world.enemy = buildEnemyForZone(state.world.zone);
    }

    return changed;
  }
};
