import { COMBAT_AREAS_BY_ID } from '../content/combatAreas.js';
import { nextRandomFloat, pickOne } from '../core/random.js';
import { partySystem } from './partySystem.js';

const MAX_CHAT_LOG = 30;
const MAX_DEFEAT_HISTORY = 10;
const MAX_ROUNDS = 8;

export const combatSystem = {
  id: 'combat',
  update(state, ctx, deltaMs) {
    if (!state.combat.autoEnabled) {
      return false;
    }

    state.combat.elapsedMs += deltaMs;

    if (state.combat.elapsedMs < state.combat.tickMs) {
      return false;
    }

    state.combat.elapsedMs -= state.combat.tickMs;
    const area = COMBAT_AREAS_BY_ID[state.combat.selectedAreaId];
    if (!area) {
      return false;
    }

    const activeMembers = partySystem.getActiveMembers(state);
    if (!activeMembers.length) {
      ctx.events.push('Combat paused: assign at least one party member.');
      return false;
    }

    const monster = generateMonster(state, area);
    const result = resolveBattle(activeMembers, monster, area.baseLevel + state.combat.streak);
    state.combat.currentMonster = monster;
    state.combat.streakTicks += 1;

    if (result.victory) {
      state.combat.streak += 1;
      state.combat.totalVictories += 1;
      state.combat.streakExp += result.exp;
      state.combat.streakGil += result.gil;

      for (const member of activeMembers) {
        const instance = state.roster.byInstanceId?.[member.instanceId];
        if (!instance) {
          continue;
        }

        instance.exp = (instance.exp ?? 0) + result.exp;
      }

      state.hero.xp += result.exp;
      state.economy.gold += result.gil;

      state.combat.recentResults.unshift({
        ts: Date.now(),
        text: `${monster.name} Lv.${monster.level} defeated · +${result.exp} EXP · +${result.gil} Gil`
      });
      state.combat.recentResults = state.combat.recentResults.slice(0, MAX_CHAT_LOG);

      ctx.events.push(`Victory streak ${state.combat.streak}: ${monster.name} Lv.${monster.level}`);
      return true;
    }

    const streakHours = Math.max((state.combat.streakTicks * state.combat.tickMs) / 3_600_000, 1 / 720);
    const defeatEntry = {
      ts: Date.now(),
      areaId: area.id,
      areaName: area.name,
      streakAtDefeat: state.combat.streak,
      expEarned: Math.floor(state.combat.streakExp),
      gilEarned: Math.floor(state.combat.streakGil),
      expPerHour: Math.floor(state.combat.streakExp / streakHours),
      gilPerHour: Math.floor(state.combat.streakGil / streakHours),
      monster: {
        id: monster.id,
        name: monster.name,
        level: monster.level
      },
      rounds: result.rounds
    };

    state.combat.defeatHistory.unshift(defeatEntry);
    state.combat.defeatHistory = state.combat.defeatHistory.slice(0, MAX_DEFEAT_HISTORY);

    state.combat.recentResults.unshift({
      ts: Date.now(),
      text: `Defeat vs ${monster.name} Lv.${monster.level} · streak reset to 0`
    });
    state.combat.recentResults = state.combat.recentResults.slice(0, MAX_CHAT_LOG);

    state.combat.streak = 0;
    state.combat.streakExp = 0;
    state.combat.streakGil = 0;
    state.combat.streakTicks = 0;

    ctx.events.push(`Party fell to ${monster.name}. Combat resumed at streak 0.`);
    return true;
  },
  selectArea(state, areaId) {
    if (!COMBAT_AREAS_BY_ID[areaId]) {
      return false;
    }

    state.combat.selectedAreaId = areaId;
    state.combat.recentResults.unshift({
      ts: Date.now(),
      text: `Route changed to ${COMBAT_AREAS_BY_ID[areaId].name}.`
    });
    state.combat.recentResults = state.combat.recentResults.slice(0, MAX_CHAT_LOG);
    return true;
  },
  setAutoEnabled(state, enabled) {
    const nextEnabled = Boolean(enabled);
    if (state.combat.autoEnabled === nextEnabled) {
      return false;
    }

    state.combat.autoEnabled = nextEnabled;
    state.combat.recentResults.unshift({
      ts: Date.now(),
      text: nextEnabled ? 'Auto-combat started.' : 'Auto-combat paused.'
    });
    state.combat.recentResults = state.combat.recentResults.slice(0, MAX_CHAT_LOG);
    return true;
  }
};

function generateMonster(state, area) {
  const base = pickOne(area.monsters, nextRandomFloat(state));
  const fullProgressStreak = Math.max(0, state.combat.streak);
  const rewardProgressStreak = Math.min(fullProgressStreak, area.softCapStreak);
  const statScalingMultiplier = 1 + fullProgressStreak * area.streakScalingPerWin;
  const rewardScalingMultiplier = 1 + rewardProgressStreak * area.streakScalingPerWin;
  const level = area.baseLevel + fullProgressStreak;

  return {
    id: base.id,
    name: base.name,
    level,
    hp: Math.floor(base.statProfile.hp * statScalingMultiplier),
    atk: Math.floor(base.statProfile.atk * statScalingMultiplier),
    def: Math.floor(base.statProfile.def * statScalingMultiplier),
    spd: Math.floor(base.statProfile.spd * statScalingMultiplier),
    exp: Math.floor(base.rewardProfile.exp * rewardScalingMultiplier),
    gil: Math.floor(base.rewardProfile.gil * rewardScalingMultiplier),
    scalingMultiplier: statScalingMultiplier,
    softCapReached: state.combat.streak >= area.softCapStreak
  };
}

function resolveBattle(activeMembers, monster) {
  const party = activeMembers.reduce(
    (acc, member) => {
      const stats = member.finalStats ?? member.baseStats;
      acc.hp += stats.hp;
      acc.atk += stats.atk;
      acc.def += stats.def;
      acc.spd += stats.spd;
      return acc;
    },
    { hp: 0, atk: 0, def: 0, spd: 0 }
  );

  let partyHp = party.hp;
  let monsterHp = monster.hp;
  const rounds = [];

  for (let round = 1; round <= MAX_ROUNDS; round += 1) {
    const partyDamage = Math.max(1, Math.floor(party.atk * 1.2 - monster.def * 0.7 + party.spd * 0.2));
    monsterHp -= partyDamage;
    rounds.push(`Round ${round}: Party hits ${monster.name} for ${partyDamage} damage (${Math.max(monsterHp, 0)} HP left).`);

    if (monsterHp <= 0) {
      return {
        victory: true,
        exp: monster.exp,
        gil: monster.gil,
        rounds
      };
    }

    const monsterDamage = Math.max(1, Math.floor(monster.atk * 1.25 - party.def * 0.55 + monster.spd * 0.15));
    partyHp -= monsterDamage;
    rounds.push(`Round ${round}: ${monster.name} strikes party for ${monsterDamage} damage (${Math.max(partyHp, 0)} HP left).`);

    if (partyHp <= 0) {
      return {
        victory: false,
        exp: 0,
        gil: 0,
        rounds
      };
    }
  }

  const victory = monsterHp < partyHp;
  return {
    victory,
    exp: victory ? monster.exp : 0,
    gil: victory ? monster.gil : 0,
    rounds
  };
}
