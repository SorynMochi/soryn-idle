import { GAME_CONFIG } from '../config/constants.js';
import { PASSIVE_CATEGORY_ORDER, PASSIVE_RESOURCE_KEYS } from '../content/passiveActions.js';
import { COMBAT_AREAS, COMBAT_AREAS_BY_ID, COMBAT_TICK_MS } from '../content/combatAreas.js';
import { STARTING_EQUIPMENT_INVENTORY } from '../content/equipment.js';
import { INITIAL_INVENTORY_MATERIALS } from '../content/resources.js';
import { INITIAL_SHARDS } from '../content/recruitmentBalance.js';

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
      activeTab: 'combat',
      airshipAssignments: {}
    },
    currencies: {
      gil: 100,
      crystalShards: INITIAL_SHARDS
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
      gold: 100,
      shards: INITIAL_SHARDS
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
    airshipQuests: {
      unlocked: false,
      unlockedQuestIds: [],
      nextRunId: 1,
      activeRunsById: {},
      activeRunsByQuestId: {},
      history: []
    },
    gacha: {
      lastPullResult: null
    },
    inventory: {
      equipment: { ...STARTING_EQUIPMENT_INVENTORY },
      materials: { ...INITIAL_INVENTORY_MATERIALS }
    },
    crafting: {
      unlocked: false,
      knownRecipeIds: [],
      stationLevels: {},
      queue: [],
      prototype: {
        selectedRecipeId: null,
        requestedCount: 1
      },
      stats: {
        attempts: 0,
        completions: 0,
        totalMaterialConsumed: 0
      }
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
      autoEnabled: false,
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

  merged.meta = isObject(merged.meta) ? merged.meta : { ...base.meta };
  merged.ui = isObject(merged.ui) ? merged.ui : { ...base.ui };
  merged.economy = isObject(merged.economy) ? merged.economy : { ...base.economy };
  merged.currencies = isObject(merged.currencies) ? merged.currencies : { ...base.currencies };
  merged.party = isObject(merged.party) ? merged.party : { ...base.party };
  merged.inventory = isObject(merged.inventory) ? merged.inventory : { ...base.inventory };
  merged.crafting = isObject(merged.crafting) ? merged.crafting : { ...base.crafting };
  merged.roster = isObject(merged.roster) ? merged.roster : { ...base.roster };
  merged.combat = isObject(merged.combat) ? merged.combat : { ...base.combat };
  merged.airshipQuests = isObject(merged.airshipQuests) ? merged.airshipQuests : { ...base.airshipQuests };
  merged.runtime = isObject(merged.runtime) ? merged.runtime : { ...base.runtime };

  merged.meta.version = GAME_CONFIG.version;
  merged.meta.rngSeed = Number.isFinite(merged.meta.rngSeed) ? merged.meta.rngSeed : Date.now() % (2 ** 32);

  if (!COMBAT_AREAS_BY_ID[merged.combat.selectedAreaId]) {
    merged.combat.selectedAreaId = COMBAT_AREAS[0].id;
  }

  merged.combat.elapsedMs = Number.isFinite(merged.combat.elapsedMs) ? Math.max(0, merged.combat.elapsedMs) : 0;
  merged.combat.autoEnabled = Boolean(merged.combat.autoEnabled);
  merged.combat.streak = Number.isFinite(merged.combat.streak) ? Math.max(0, Math.floor(merged.combat.streak)) : 0;
  merged.combat.totalVictories = Number.isFinite(merged.combat.totalVictories) ? Math.max(0, Math.floor(merged.combat.totalVictories)) : 0;
  merged.combat.streakExp = Number.isFinite(merged.combat.streakExp) ? Math.max(0, merged.combat.streakExp) : 0;
  merged.combat.streakGil = Number.isFinite(merged.combat.streakGil) ? Math.max(0, merged.combat.streakGil) : 0;
  merged.combat.streakTicks = Number.isFinite(merged.combat.streakTicks) ? Math.max(0, Math.floor(merged.combat.streakTicks)) : 0;
  merged.combat.recentResults = Array.isArray(merged.combat.recentResults) ? merged.combat.recentResults.slice(0, 30) : [];
  merged.combat.defeatHistory = Array.isArray(merged.combat.defeatHistory) ? merged.combat.defeatHistory.slice(0, 10) : [];

  merged.airshipQuests.unlockedQuestIds = Array.isArray(merged.airshipQuests.unlockedQuestIds)
    ? [...new Set(merged.airshipQuests.unlockedQuestIds.filter((id) => typeof id === 'string'))]
    : [];
  merged.airshipQuests.nextRunId = Number.isFinite(merged.airshipQuests.nextRunId)
    ? Math.max(1, Math.floor(merged.airshipQuests.nextRunId))
    : 1;
  merged.airshipQuests.activeRunsById = isObject(merged.airshipQuests.activeRunsById) ? merged.airshipQuests.activeRunsById : {};
  merged.airshipQuests.activeRunsByQuestId = isObject(merged.airshipQuests.activeRunsByQuestId) ? merged.airshipQuests.activeRunsByQuestId : {};
  merged.airshipQuests.history = Array.isArray(merged.airshipQuests.history) ? merged.airshipQuests.history.slice(0, 30) : [];

  merged.ui.airshipAssignments = isObject(merged.ui.airshipAssignments) ? merged.ui.airshipAssignments : {};

  const economyGold = Number(merged.economy.gold);
  const economyShards = Number(merged.economy.shards);
  const currencyGil = Number(merged.currencies.gil);
  const currencyShards = Number(merged.currencies.crystalShards);

  merged.economy.gold = Number.isFinite(economyGold)
    ? Math.max(0, economyGold)
    : Number.isFinite(currencyGil) ? Math.max(0, currencyGil) : 0;
  merged.economy.shards = Number.isFinite(economyShards)
    ? Math.max(0, economyShards)
    : Number.isFinite(currencyShards) ? Math.max(0, currencyShards) : 0;

  merged.currencies.gil = Math.floor(merged.economy.gold);
  merged.currencies.crystalShards = Math.floor(merged.economy.shards);
  merged.inventory.equipment = normalizeEquipmentInventory(merged.inventory.equipment);
  merged.inventory.materials = normalizeMaterialInventory(merged.inventory.materials);

  merged.crafting.knownRecipeIds = Array.isArray(merged.crafting.knownRecipeIds)
    ? [...new Set(merged.crafting.knownRecipeIds.filter((id) => typeof id === 'string'))]
    : [];
  merged.crafting.stationLevels = isObject(merged.crafting.stationLevels) ? merged.crafting.stationLevels : {};
  merged.crafting.queue = Array.isArray(merged.crafting.queue) ? merged.crafting.queue : [];
  merged.crafting.prototype = isObject(merged.crafting.prototype) ? merged.crafting.prototype : {
    selectedRecipeId: null,
    requestedCount: 1
  };
  merged.crafting.stats = isObject(merged.crafting.stats) ? merged.crafting.stats : {
    attempts: 0,
    completions: 0,
    totalMaterialConsumed: 0
  };

  merged.roster.ownedInstanceIds = Array.isArray(merged.roster.ownedInstanceIds) ? merged.roster.ownedInstanceIds : [];
  merged.roster.byInstanceId = isObject(merged.roster.byInstanceId) ? merged.roster.byInstanceId : {};

  for (const instanceId of merged.roster.ownedInstanceIds) {
    const instance = merged.roster.byInstanceId[instanceId];
    if (!instance) continue;

    instance.equipmentSlots = normalizeEquipmentSlots(instance.equipmentSlots);
    instance.lockState = normalizeLockState(instance.lockState);
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

function normalizeMaterialInventory(rawInventory) {
  const normalized = { ...INITIAL_INVENTORY_MATERIALS };
  if (!isObject(rawInventory)) {
    return normalized;
  }

  for (const [materialId, amount] of Object.entries(rawInventory)) {
    normalized[materialId] = Math.max(0, Number(amount) || 0);
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

function normalizeLockState(rawLockState) {
  if (!isObject(rawLockState) || !rawLockState.locked) {
    return null;
  }

  return {
    locked: true,
    system: typeof rawLockState.system === 'string' ? rawLockState.system : 'unknown',
    referenceId: typeof rawLockState.referenceId === 'string' ? rawLockState.referenceId : '',
    reason: typeof rawLockState.reason === 'string' ? rawLockState.reason : 'Unavailable',
    untilTs: Number.isFinite(rawLockState.untilTs) ? rawLockState.untilTs : null
  };
}
