import { GAME_CONFIG } from '../config/constants.js';
import { CHARACTER_ROSTER, RECRUIT_CONFIG } from '../content/roster.js';
import { SAMPLE_QUESTS } from '../content/quests.js';

export function createInitialState(now = Date.now()) {
  return {
    meta: {
      version: GAME_CONFIG.version,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now
    },
    ui: {
      activeTab: 'overview'
    },
    currencies: {
      gil: 100,
      crystalShards: RECRUIT_CONFIG.shardCostPerPull * 3
    },
    party: {
      activeIds: ['c-lyra-dawnwell'],
      roster: [CHARACTER_ROSTER[0]]
    },
    recruit: {
      shardCostPerPull: RECRUIT_CONFIG.shardCostPerPull,
      pool: CHARACTER_ROSTER
    },
    passive: {
      status: 'Not Started',
      notes: 'Passive route simulation will be connected in a later milestone.'
    },
    combat: {
      zone: 1,
      status: 'Standby',
      notes: 'Combat simulation scaffolding only in this pass.'
    },
    quests: {
      entries: SAMPLE_QUESTS
    },
    inventory: {
      materials: [
        { id: 'm-crystal-dust', name: 'Crystal Dust', qty: 5 },
        { id: 'm-ironleaf', name: 'Ironleaf', qty: 3 }
      ],
      equipment: []
    },
    runtime: {
      totalPlayTimeMs: 0,
      autosaveCount: 0,
      lastOfflineDurationMs: 0
    }
  };
}

export function normalizeState(rawState) {
  const base = createInitialState(rawState?.meta?.createdAt ?? Date.now());
  const merged = deepMerge(base, rawState ?? {});

  merged.meta.version = GAME_CONFIG.version;

  if (!Array.isArray(merged.party.roster) || merged.party.roster.length === 0) {
    merged.party.roster = [CHARACTER_ROSTER[0]];
    merged.party.activeIds = [CHARACTER_ROSTER[0].id];
  }

  if (typeof merged.currencies.gil !== 'number') merged.currencies.gil = 100;
  if (typeof merged.currencies.crystalShards !== 'number') {
    merged.currencies.crystalShards = RECRUIT_CONFIG.shardCostPerPull * 3;
  }

  return merged;
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


// Compatibility hooks for pre-shell simulation modules; values are placeholders.
export function buildEnemyForZone(zone = 1) {
  return {
    name: `Wisp ${zone}`,
    hp: 10 + zone * 2,
    maxHp: 10 + zone * 2,
    attack: 1 + zone,
    rewardGold: 2 + zone,
    rewardXp: 3 + zone
  };
}

export function xpToNextLevel(level = 1) {
  return 20 + level * 5;
}
