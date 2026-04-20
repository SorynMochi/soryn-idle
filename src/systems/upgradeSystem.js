export const upgradeSystem = {
  id: 'upgrades',
  update() {
    return false;
  },
  tryBuyAttack(state) {
    const cost = 50 + state.upgrades.attackRank * 30;
    if (state.economy.gold < cost) return false;

    state.economy.gold -= cost;
    state.upgrades.attackRank += 1;
    state.hero.attack += 3;
    return true;
  },
  tryBuyVitality(state) {
    const cost = 50 + state.upgrades.vitalityRank * 30;
    if (state.economy.gold < cost) return false;

    state.economy.gold -= cost;
    state.upgrades.vitalityRank += 1;
    state.hero.maxHp += 12;
    state.hero.hp = state.hero.maxHp;
    return true;
  }
};
