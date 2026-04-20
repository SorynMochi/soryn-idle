# Data Model (Major Structures)

This document defines the primary data shapes for the game. The goal is to keep simulation logic generic while storing names, numbers, and progression tuning in content modules.

## Design goals

- LocalStorage-friendly: plain JSON-serializable objects.
- Stable IDs for all cross-references.
- Versionable top-level save object.
- Easy content scaling from small starter pool to large roster.

---

## 1) Top-level save schema

```js
{
  version: 1,
  meta: {
    createdAt: 0,
    updatedAt: 0,
    totalPlaySeconds: 0,
    lastTickAt: 0,
    rngSeed: 0
  },
  currencies: {},
  roster: {},
  party: {},
  gacha: {},
  passives: {},
  combat: {},
  quests: {},
  equipment: {},
  unlocks: {},
  logs: {},
  defeatHistory: [],
  characterPassives: {},
  craftingHooks: {}
}
```

---

## 2) Characters

### Character content definition (`src/content/characters.js`)

```js
{
  id: "char_lyra",
  name: "Lyra",
  tierId: "rare",
  baseStats: { hp: 120, mp: 80, atk: 24, def: 18, mag: 28, res: 20, spd: 15 },
  growth: { hp: 8, mp: 6, atk: 2, def: 2, mag: 3, res: 2, spd: 1 },
  roles: ["mage", "support"],
  equipProfileId: "staff_cloth_accessory",
  passiveBonusProfileId: "pb_lyra_01"
}
```

### Owned character instance (`save.roster.byInstanceId`)

```js
{
  instanceId: "inst_001",
  characterId: "char_lyra",
  level: 1,
  exp: 0,
  awakenRank: 0,
  traitRolls: {},
  equipmentSlots: {
    weapon: null,
    armor: null,
    accessory: null
  },
  lockedBy: null // e.g. "quest:airship_03"
}
```

**Why both content + instance?** Content defines what a character is. Instance data tracks player-specific progress.

---

## 3) Party

```js
{
  maxSlots: 4,
  activeInstanceIds: ["inst_001", null, null, null],
  presets: {
    default: ["inst_001", null, null, null]
  }
}
```

Validation rules:
- No duplicates in `activeInstanceIds`.
- Locked characters cannot be slotted.
- Empty slots allowed.

---

## 4) Character tiers and gacha weights

### Tier definitions (`src/content/characterTiers.js`)

```js
{
  common: { rank: 1, color: "#9aa0a6" },
  uncommon: { rank: 2, color: "#6bcf63" },
  rare: { rank: 3, color: "#4da3ff" },
  epic: { rank: 4, color: "#b36dff" },
  legendary: { rank: 5, color: "#ffb347" }
}
```

### Gacha pool weights (`src/content/gachaPools.js`)

```js
{
  poolId: "standard",
  cost: { currencyId: "crystal_shard", amount: 1 },
  tierWeights: {
    common: 0.55,
    uncommon: 0.25,
    rare: 0.13,
    epic: 0.06,
    legendary: 0.01
  },
  guarantees: {
    pityCounterMax: 80,
    pityTierMin: "epic"
  }
}
```

---

## 5) Equipment types and restrictions

### Equipment content (`src/content/equipment.js`)

```js
{
  id: "eq_bronze_sword",
  slot: "weapon", // weapon | armor | accessory
  weaponType: "sword", // optional per slot
  tier: "common",
  statMods: { atkFlat: 6, hpFlat: 20 },
  passiveEffects: []
}
```

### Restriction profiles (`src/content/equipment.js`)

```js
{
  id: "sword_plate_accessory",
  slotRules: {
    weapon: ["sword"],
    armor: ["plate"],
    accessory: ["accessory"]
  }
}
```

### Equipment inventory and per-instance slots (`save.inventory` + `save.roster`)

```js
{
  inventory: {
    equipment: {
      gear_ironblade: 1,
      gear_luck_charm: 2
    }
  },
  roster: {
    byInstanceId: {
      inst_0001: {
        equipmentSlots: {
          weapon: "gear_ironblade",
          armor: null,
          accessory: "gear_luck_charm"
        }
      }
    }
  }
}
```

Rules:
- Weapon and armor categories are validated against `slotRules`.
- Accessories are universal via `accessory` category support in every profile.
- Equipping consumes inventory quantity; unequipping returns the item.

---

## 6) Passive actions and passive skill trees

### Passive action runtime (`save.passives.actionsById`)

```js
{
  mining: {
    level: 1,
    exp: 0,
    unlocked: true,
    assignedInstanceIds: [],
    progressSeconds: 0,
    lastResolvedAt: 0
  }
}
```

### Passive skill tree content (`src/content/passives.js`)

```js
{
  actionId: "mining",
  nodes: [
    {
      id: "mining_node_01",
      name: "Steady Swing",
      cost: { currencyId: "gil", amount: 100 },
      requires: [],
      effects: [{ type: "yield_mult", value: 0.1 }]
    }
  ]
}
```

### Passive skill unlock state (`save.passives.unlockedNodes`)

```js
{
  mining: ["mining_node_01"]
}
```

---

## 7) Combat areas

```js
{
  id: "area_windscar_plains",
  name: "Windscar Plains",
  unlockId: "unlock_area_01",
  enemyPoolId: "pool_windscar",
  rewardProfileId: "reward_early_01",
  softCap: {
    streakAtCap: 120,
    rewardMultCap: 3.5,
    postCapCurve: "log_slow"
  }
}
```

---

## 8) Monster templates

```js
{
  id: "mon_wild_fang",
  name: "Wild Fang",
  family: "beast",
  baseStats: { hp: 90, atk: 18, def: 10, mag: 4, res: 8, spd: 12 },
  growthByAreaTier: { hp: 1.18, atk: 1.12, def: 1.1 },
  lootTableId: "loot_beast_01",
  abilities: ["bite", "howl"]
}
```

---

## 9) Battle streaks and soft caps

```js
{
  currentAreaId: "area_windscar_plains",
  streak: {
    current: 0,
    bestByArea: { area_windscar_plains: 34 },
    lastResetReason: null
  },
  rewardMods: {
    streakMult: 1.0,
    softCapApplied: false
  }
}
```

---

## 10) Battle logs

Use bounded arrays/ring buffers to prevent memory growth.

```js
{
  battleLogs: [
    {
      id: "log_1001",
      at: 1710000000,
      areaId: "area_windscar_plains",
      result: "win",
      streakAfter: 12,
      rewards: { gil: 42, exp: 18 },
      summary: "Party defeated Wild Fang."
    }
  ],
  maxBattleLogs: 250
}
```

---

## 11) Defeat history

Keep last N defeats (project target: 10).

```js
[
  {
    at: 1710000100,
    areaId: "area_windscar_plains",
    streakBeforeDefeat: 27,
    partySnapshot: {
      instanceIds: ["inst_001"],
      stats: { hpTotal: 410, atkTotal: 58 }
    },
    enemySnapshot: {
      monsterTemplateId: "mon_wild_fang",
      stats: { hp: 520, atk: 61 }
    },
    causeTags: ["low_def", "speed_gap"]
  }
]
```

---

## 12) Airship quests

### Quest content (`src/content/quests.js`)

```js
{
  id: "quest_sky_ruins_01",
  name: "Survey the Sky Ruins",
  durationSec: 3600,
  requirements: {
    minPartyPower: 250,
    requiredTags: ["scout"],
    minCharacters: 2
  },
  rewards: {
    success: [{ type: "currency", id: "crystal_shard", amount: 4 }],
    failure: [{ type: "currency", id: "gil", amount: 120 }]
  },
  successModel: { baseChance: 0.6, powerWeight: 0.25 }
}
```

### Active quest runtime (`save.quests.activeById`)

```js
{
  quest_sky_ruins_01: {
    startedAt: 1710000200,
    endsAt: 1710003800,
    assignedInstanceIds: ["inst_001", "inst_002"],
    locked: true,
    resolved: false
  }
}
```

---

## 13) Currencies

```js
{
  gil: { amount: 100, softCap: null },
  crystal_shard: { amount: 3, softCap: null },
  valor_token: { amount: 0, softCap: 99999 }
}
```

Use generic currency maps so new currencies can be added without new engine fields.

---

## 14) Unlocks

```js
{
  ids: {
    unlock_area_01: true,
    unlock_passive_studying: false,
    unlock_airship_quests: false
  },
  flags: {
    tutorialSeen: true
  }
}
```

---

## 15) Character passive bonuses

### Content profile (`src/content/characters.js` or dedicated module)

```js
{
  id: "pb_lyra_01",
  effects: [
    { scope: "party", type: "mag_pct", value: 0.08 },
    { scope: "passive:studying", type: "yield_pct", value: 0.12 }
  ]
}
```

### Runtime cache (`save.characterPassives`)

```js
{
  activeEffects: {
    party: [{ sourceInstanceId: "inst_001", type: "mag_pct", value: 0.08 }],
    passive_studying: [{ sourceInstanceId: "inst_001", type: "yield_pct", value: 0.12 }]
  }
}
```

---

## 16) Future crafting hooks

No full crafting system yet. Define placeholders only.

```js
{
  materialInventory: {
    ore_fragment: 0,
    ancient_bloom: 0
  },
  emitterStats: {
    totalMaterialsEarned: 0
  },
  reserved: {
    recipeFlags: {},
    stationLevels: {}
  }
}
```

Hook examples:
- Passive action reward emits `{ type: "material", id, amount }`.
- Quest reward emits optional materials.
- Combat loot tables can include low-rate material drops.

---

## Practical scaling notes

- Use stable IDs everywhere (`char_*`, `mon_*`, `area_*`, `quest_*`) to keep references safe.
- Keep save data normalized enough for performance (`byId` maps), but not so abstract it becomes hard to read.
- Prefer additive schema evolution: new optional fields + migrations, not destructive rewrites.

---

## Current MVP implementation notes (April 2026)

The runtime now includes a system-heavy, content-light recruitment + party slice:

- Character tiers are implemented as data (`common` through `legendary`) in content modules.
- Recruitment uses weighted shard pulls from a seeded starter roster (one starter unit + small gacha pool).
- Party state supports `maxSlots: 4`, empty slots, and bench management via owned roster instances.
- Character entries now include `passiveSpecialty` and `equipmentHook` fields as forward-compatible data hooks.
- Equipment restrictions are not enforced yet; hooks exist only in data model.
