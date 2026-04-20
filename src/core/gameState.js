import { INITIAL_SHARDS } from '../content/recruitmentBalance.js';
import { PASSIVE_CATEGORY_ORDER, PASSIVE_RESOURCE_KEYS } from '../content/passiveActions.js';
import { GAME_CONFIG } from '../config/constants.js';
import { partySystem } from '../systems/partySystem.js';

export function createInitialState(now = Date.now()) {
  const enemy = buildEnemyForZone(1);

  return {
    meta: {
      version: GAME_CONFIG.version,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      rngSeed: now % (2 ** 32)
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
      shards: INITIAL_SHARDS
    },
    roster: {
      nextInstanceId: 1,
      ownedInstanceIds: [],
      byInstanceId: {}
    },
    party: {
      minSize: 1,
      maxSlots: 4,
      activeInstanceIds: [null, null, null, null]
    },
    gacha: {
      lastPullResult: null
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

    passive: {
      selectedCategoryId: PASSIVE_CATEGORY_ORDER[0],
      resources: Object.fromEntries(PASSIVE_RESOURCE_KEYS.map((key) => [key, 0])),
      categories: Object.fromEntries(
        PASSIVE_CATEGORY_ORDER.map((categoryId, index) => [
          categoryId,
          {
            unlocked: index === 0,
            upgradeLevel: 0,
            totalGenerated: 0,
            elapsedMs: 0
          }
        ])
      )
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

  if (!Number.isFinite(merged.meta.rngSeed)) {
    merged.meta.rngSeed = Date.now() % (2 ** 32);
  }

  if (!merged.world.enemy || typeof merged.world.enemy.hp !== 'number') {
    merged.world.enemy = buildEnemyForZone(merged.world.zone);
  }

  if (!Number.isFinite(merged.roster.nextInstanceId)) {
    merged.roster.nextInstanceId = 1;
  }

  merged.roster.ownedInstanceIds = merged.roster.ownedInstanceIds.filter((instanceId) =>
    Boolean(merged.roster.byInstanceId[instanceId])
  );


  for (const resourceKey of PASSIVE_RESOURCE_KEYS) {
    if (!Number.isFinite(merged.passive.resources[resourceKey])) {
      merged.passive.resources[resourceKey] = 0;
    }
  }

  for (const [index, categoryId] of PASSIVE_CATEGORY_ORDER.entries()) {
    const categoryState = merged.passive.categories[categoryId] ?? {};
    merged.passive.categories[categoryId] = {
      unlocked: Boolean(categoryState.unlocked) || index === 0,
      upgradeLevel: Number.isFinite(categoryState.upgradeLevel) ? Math.max(0, Math.floor(categoryState.upgradeLevel)) : 0,
      totalGenerated: Number.isFinite(categoryState.totalGenerated) ? Math.max(0, categoryState.totalGenerated) : 0,
      elapsedMs: Number.isFinite(categoryState.elapsedMs) ? Math.max(0, categoryState.elapsedMs) : 0
    };
  }

  if (!PASSIVE_CATEGORY_ORDER.includes(merged.passive.selectedCategoryId) || !merged.passive.categories[merged.passive.selectedCategoryId]?.unlocked) {
    merged.passive.selectedCategoryId = PASSIVE_CATEGORY_ORDER.find((categoryId) => merged.passive.categories[categoryId]?.unlocked) ?? PASSIVE_CATEGORY_ORDER[0];
  }

  partySystem.normalize(merged);

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
