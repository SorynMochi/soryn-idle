import { GAME_CONFIG } from '../config/constants.js';

export function createInitialState(now = Date.now()) {
  const enemy = buildEnemyForZone(1);

  return {
    meta: {
      version: GAME_CONFIG.version,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now
    },
    hero: {
      level: 1,
      xp: 0,
      xpToNext: 20,
      attack: 5,
      maxHp: 40,
      hp: 40
    },
    economy: {
      gold: 0,
      shards: 0
    },
    world: {
      zone: 1,
      kills: 0,
      enemy
    },
    upgrades: {
      attackRank: 0,
      vitalityRank: 0,
      automationRank: 0
    },
    runtime: {
      totalPlayTimeMs: 0,
      totalTicks: 0
    }
  };
}

export function normalizeState(rawState) {
  const base = createInitialState(rawState?.meta?.createdAt ?? Date.now());
  const merged = deepMerge(base, rawState ?? {});

  merged.meta.version = GAME_CONFIG.version;
  merged.hero.hp = clamp(merged.hero.hp, 0, merged.hero.maxHp);

  if (!merged.world.enemy || typeof merged.world.enemy.hp !== 'number') {
    merged.world.enemy = buildEnemyForZone(merged.world.zone);
  }

  return merged;
}

export function buildEnemyForZone(zone) {
  const scalar = 1 + (zone - 1) * 0.18;
  const maxHp = Math.floor(24 * scalar);

  return {
    name: `Slime Z${zone}`,
    hp: maxHp,
    maxHp,
    attack: Math.floor(2 * scalar),
    rewardGold: Math.floor(6 * scalar),
    rewardXp: Math.floor(8 * scalar)
  };
}

export function xpToNextLevel(level) {
  return Math.floor(20 + level * level * 5);
}

function deepMerge(target, source) {
  if (typeof source !== 'object' || source === null) {
    return target;
  }

  const output = { ...target };
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (Array.isArray(sourceValue)) {
      output[key] = [...sourceValue];
      continue;
    }

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key] = deepMerge(targetValue, sourceValue);
      continue;
    }

    output[key] = sourceValue;
  }

  return output;
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
