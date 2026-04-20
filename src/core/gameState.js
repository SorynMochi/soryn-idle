import { GAME_CONFIG } from '../config/constants.js';
import { PASSIVE_CATEGORY_ORDER, PASSIVE_RESOURCE_KEYS } from '../content/passiveActions.js';
import { COMBAT_AREAS, COMBAT_AREAS_BY_ID, COMBAT_TICK_MS } from '../content/combatAreas.js';
import { STARTING_EQUIPMENT_INVENTORY } from '../content/equipment.js';

export function createInitialState(now = Date.now()) {
  return {
    meta: {
      version: GAME_CONFIG.version,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
      rngSeed: now % (2 ** 32)
    },
    ui: {
      activeTab: 'combat'
    },
    currencies: {
      gil: 0,
      crystalShards: 30
    },
    hero: {
      level: 1,
      hp: 120,
      maxHp: 120,
      attack: 18,
      xp: 0,
      xpToNext: xpToNextLevel(1)
    },
    economy: {
      gold: 0,
      shards: 30
    },
    upgrades: {
      attackRank: 0,
      vitalityRank: 0,
      automationRank: 0
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
    inventory: {
      equipment: { ...STARTING_EQUIPMENT_INVENTORY }
    },
    passive: {
      selectedCategoryId: PASSIVE_CATEGORY_ORDER[0],
      resources: Object.fromEntries(PASSIVE_RESOURCE_KEYS.map((key) => [key, 0])),
      categories: Object.fromEntries(
        PASSIVE_CATEGORY_ORDER.map((categoryId, index) => [
          categoryId,
          { unlocked: index === 0, upgradeLevel: 0, totalGenerated: 0, elapsedMs: 0 }
        ])
      )
    },
    combat: {
      tickMs: COMBAT_TICK_MS,
      elapsedMs: 0,
      selectedAreaId: COMBAT_AREAS[0].id,
      streak: 0,
      totalVictories: 0,
      streakExp: 0,
      streakGil: 0,
      streakTicks: 0,
      currentMonster: null,
      recentResults: [],
      defeatHistory: []
    },
    runtime: {
      totalPlayTimeMs: 0,
      totalTicks: 0,
      autosaveCount: 0,
      lastOfflineDurationMs: 0
    }
  };
}

export function normalizeState(rawState) {
  const base = createInitialState(rawState?.meta?.createdAt ?? Date.now());
  const merged = deepMerge(base, rawState ?? {});

  merged.meta.version = GAME_CONFIG.version;
  merged.meta.rngSeed = Number.isFinite(merged.meta.rngSeed) ? merged.meta.rngSeed : Date.now() % (2 ** 32);

  if (!COMBAT_AREAS_BY_ID[merged.combat.selectedAreaId]) {
    merged.combat.selectedAreaId = COMBAT_AREAS[0].id;
  }

  merged.combat.elapsedMs = Number.isFinite(merged.combat.elapsedMs) ? Math.max(0, merged.combat.elapsedMs) : 0;
  merged.combat.streak = Number.isFinite(merged.combat.streak) ? Math.max(0, Math.floor(merged.combat.streak)) : 0;
  merged.combat.totalVictories = Number.isFinite(merged.combat.totalVictories) ? Math.max(0, Math.floor(merged.combat.totalVictories)) : 0;
  merged.combat.streakExp = Number.isFinite(merged.combat.streakExp) ? Math.max(0, merged.combat.streakExp) : 0;
  merged.combat.streakGil = Number.isFinite(merged.combat.streakGil) ? Math.max(0, merged.combat.streakGil) : 0;
  merged.combat.streakTicks = Number.isFinite(merged.combat.streakTicks) ? Math.max(0, Math.floor(merged.combat.streakTicks)) : 0;
  merged.combat.recentResults = Array.isArray(merged.combat.recentResults) ? merged.combat.recentResults.slice(0, 30) : [];
  merged.combat.defeatHistory = Array.isArray(merged.combat.defeatHistory) ? merged.combat.defeatHistory.slice(0, 10) : [];

  merged.currencies.gil = Math.floor(merged.economy.gold);
  merged.currencies.crystalShards = Math.floor(merged.economy.shards);
  merged.inventory.equipment = normalizeEquipmentInventory(merged.inventory.equipment);

  for (const instanceId of merged.roster.ownedInstanceIds) {
    const instance = merged.roster.byInstanceId[instanceId];
    if (!instance) continue;

    instance.equipmentSlots = normalizeEquipmentSlots(instance.equipmentSlots);
  }

  return merged;
}

export function xpToNextLevel(level = 1) {
  return 20 + level * 5;
}

function deepMerge(target, source) {
  if (typeof source !== 'object' || source === null) return target;

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

function normalizeEquipmentInventory(rawInventory) {
  const normalized = { ...STARTING_EQUIPMENT_INVENTORY };
  if (!isObject(rawInventory)) {
    return normalized;
  }

  for (const [itemId, amount] of Object.entries(rawInventory)) {
    normalized[itemId] = Math.max(0, Math.floor(Number(amount) || 0));
  }

  return normalized;
}

function normalizeEquipmentSlots(rawSlots) {
  return {
    weapon: typeof rawSlots?.weapon === 'string' ? rawSlots.weapon : null,
    armor: typeof rawSlots?.armor === 'string' ? rawSlots.armor : null,
    accessory: typeof rawSlots?.accessory === 'string' ? rawSlots.accessory : null
  };
}
