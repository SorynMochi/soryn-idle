# System Boundaries

This document explains how to separate the game into main systems so features stay maintainable as content grows.

## Why boundaries matter

When systems are mixed together, small feature changes cause large bugs. Clear boundaries let you:
- add content faster,
- test logic in smaller pieces,
- avoid hardcoded data in engine code.

---

## High-level separation

## 1) Core runtime (`src/core/`)

**Responsibility:** own app lifecycle and shared infrastructure.

- State initialization and canonical save schema.
- Save/load/migrations.
- Tick loop and offline catch-up.
- Optional event dispatch utility.

**Must not do:** contain character names, balance numbers, encounter definitions, or quest tables.

## 2) Systems layer (`src/systems/`)

**Responsibility:** pure gameplay logic operating on state + content inputs.

Each system should expose small entry points like:
- `update(deltaSec, state, content)`
- `runAction(payload, state, content)`
- `validate(state, content)`

**Must not do:** define large content catalogs inline.

## 3) Content layer (`src/content/`)

**Responsibility:** all tunable data and authored game content.

- Characters, tiers, gacha pools.
- Monster templates and area configs.
- Quest definitions.
- Equipment catalogs and restriction profiles.
- Passive trees and unlock tables.
- Economy values and reward constants.

**Must not do:** mutate runtime state directly.

## 4) UI layer (existing app shell + future panels)

**Responsibility:** render state and send player actions.

- Reads derived view models.
- Sends intents (pull gacha, assign party, start quest).
- Displays logs, defeat history, progression data.

**Must not do:** implement core progression math in UI handlers.

---

## Main systems and their boundaries

## Gacha system

**Owns**
- Pull execution, tier roll, duplicate handling.

**Reads**
- Currency balances.
- Gacha pool content data.
- Character/tier definitions.

**Writes**
- Currency spend results.
- Roster additions/duplicate resources.
- Pity counters.

**Does not own**
- Party slot assignment.

## Party system

**Owns**
- Active party slots and validation.
- Character lock checks (quest-dispatched units unavailable).

**Reads**
- Roster instances.
- Equipment state (for derived stat preview).

**Writes**
- `save.party`.

**Does not own**
- Combat resolution.

## Passive system

**Owns**
- Passive action timers and yields.
- Passive skill tree unlock application.

**Reads**
- Passive content trees.
- Assigned characters and applicable passive bonuses.

**Writes**
- Passive progression state.
- Currency/material rewards.

**Does not own**
- Gacha pulls or combat streak logic.

## Combat system

**Owns**
- Encounter generation.
- Battle resolution.
- Streak progression and soft cap application.
- Battle log entries and defeat history pushes.

**Reads**
- Active party, character stats, equipment effects.
- Area and monster content data.
- Reward profiles.

**Writes**
- Combat state (streak, current battle result).
- Rewards.
- Logs/defeat archive.

**Does not own**
- Quest dispatch lifecycle.

## Quest system (airship dispatch)

**Owns**
- Quest start/resolve flow.
- Timer checks and success/failure rolls.
- Character lock/unlock from dispatch.

**Reads**
- Quest definitions.
- Character availability and power summaries.

**Writes**
- Active/completed quest states.
- Reward outputs.
- Quest-related logs.

**Does not own**
- Party combat stats calculation internals.

## Equipment system

**Owns**
- Equip/unequip validation.
- Restriction profile checks.
- Effective stat modifier aggregation outputs.

**Reads**
- Equipment content and restriction profiles.
- Character equip profile.

**Writes**
- Equipment assignment state.
- Derived stat modifiers cache.

**Does not own**
- Inventory drop generation rules in combat.

## Progression/unlocks system

**Owns**
- Unlock flags and progression gates.
- Shared unlock checks for areas/passives/quests.

**Reads**
- Unlock content requirements.
- State milestones.

**Writes**
- `save.unlocks`.

**Does not own**
- Feature-specific mechanics (combat/passive math).

---

## Shared data flow pattern

Recommended per tick:
1. Core loop computes `deltaSec`.
2. Passive system update.
3. Quest timer update.
4. Combat update (if enabled and party valid).
5. Progression/unlock checks.
6. Log compaction + save scheduling.

This order favors predictable progression and avoids double-spending side effects.

---

## Content scalability strategy

To grow from a seeded roster to large pools:
- Keep content in separate files by domain (`characters.js`, `monsters.js`, `areas.js`, etc.).
- Use IDs and references instead of embedding full objects repeatedly.
- Add small validation scripts to catch broken references early.
- Keep system logic generic (e.g., “select monster from area pool”), not specific to one area/character.

---

## Crafting boundary (hooks only)

For now, only reserve interfaces:
- reward pipeline supports `type: "material"`,
- state includes `craftingHooks.materialInventory`,
- no crafting recipes/stations/progression math.

This keeps current systems forward-compatible without pretending crafting is already designed.
