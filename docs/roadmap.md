# Technical Implementation Plan

This plan turns the project guidance into a concrete implementation sequence for a **browser-based idle JRPG** built with **HTML/CSS/vanilla JS**. It prioritizes a stable state model, data-driven systems, and clear boundaries between simulation code and content definitions.

## Core architecture principles

1. **Engine vs content split is mandatory**
   - `src/core/` and `src/systems/` contain generic runtime logic.
   - Character names, area tuning, gacha rates, quest definitions, loot pools, and balance numbers live in content modules (for example `src/content/*.js`).
2. **State-first design**
   - Every feature starts by defining state shape + persistence behavior before UI polish.
3. **Data-driven expansion**
   - Adding a new character, monster, area, or quest should normally mean adding/adjusting data objects rather than rewriting engine logic.
4. **Composable parallel systems**
   - Combat, passive actions, quests, and gacha operate as separate systems coordinated by the game loop.
5. **Crafting is hooks-only for now**
   - Reserve data fields and event interfaces, but do not ship full crafting mechanics yet.

---

## Module layout (target)

- `src/core/`
  - `gameState.js`: canonical mutable state and initialization.
  - `saveLoad.js`: serialization, migrations, localStorage IO.
  - `gameLoop.js`: tick orchestration and offline catch-up.
  - `eventBus.js` (optional small utility): inter-system events.
- `src/systems/`
  - `gachaSystem.js`
  - `partySystem.js`
  - `passiveSystem.js`
  - `combatSystem.js`
  - `questSystem.js`
  - `equipmentSystem.js`
  - `progressionSystem.js` (unlocks, streak modifiers, shared progression helpers)
- `src/content/` (new/expanded)
  - `characters.js`, `characterTiers.js`
  - `gachaPools.js`
  - `equipment.js`
  - `passives.js`
  - `areas.js`, `monsters.js`
  - `quests.js`
  - `economy.js` (currencies, costs, reward constants)
  - `unlocks.js`

> Tradeoff note: plain JS object modules are easier to read and edit than heavy class hierarchies, especially for a growing content pool.

---

## Recommended implementation order

### 1) Shell + state + save/load

**Why first:** all later systems depend on stable state and persistence.

**Implement**
- App shell UI placeholders for major panels (party, combat, passives, quests, logs).
- `GameState` factory with explicit default schema.
- Save/load manager:
  - versioned save format,
  - migration pipeline,
  - autosave cadence,
  - manual export/import hooks (optional but recommended).
- Offline progress catch-up boundaries (max simulated seconds/ticks).

**Done when**
- Fresh save initializes all required fields.
- Reload restores exact state.
- Version mismatch can migrate old saves safely.

### 2) Gacha + party

**Why second:** this creates the roster and active team used by all progression loops.

**Implement**
- Character tier table and pull-weight tables from content modules.
- Gacha execution system (currency spend, weighted roll, duplicate behavior).
- Party management (active slots, validation, lock handling for quest-dispatched units).
- Roster indexing helpers (owned count, character lookup, duplicates).

**Done when**
- Pull results are deterministic from input state + RNG seed path.
- Party assignment obeys slot rules and lock rules.

### 3) Passive actions

**Why third:** gives parallel, non-combat progression and early idle depth.

**Implement**
- Passive action scheduler (Mining/Chopping/Gathering/Studying/Training).
- Passive skill trees from content data (nodes, costs, prerequisites, effects).
- Tick-based reward generation and unlock checks.
- Hooks for future material outputs (crafting placeholder only).

**Done when**
- Multiple passive tracks can run without corrupting combat/quest state.
- Passive upgrades persist and modify yields.

### 4) Combat

**Why fourth:** combat depends on roster, party stats, and baseline economy flow.

**Implement**
- Area selection and encounter generation from content data.
- Monster template scaling and battle resolution loop.
- Battle streak engine with reward multiplier growth + per-area soft caps.
- Battle logs + structured defeat history records.

**Done when**
- Auto-battle loop runs from data only (no hardcoded monster names/stats in engine).
- Defeats reset streak and archive clean records.

### 5) Quests (airship dispatch)

**Why fifth:** introduces roster allocation strategy after core loops exist.

**Implement**
- Airship quest catalog, requirements, timers, rewards, failure rules.
- Dispatch lifecycle (start, in-progress, complete, claim).
- Character lock/unlock integration with party system.

**Done when**
- Dispatched characters are unavailable elsewhere.
- Quest outcomes and rewards are logged and persisted.

### 6) Equipment

**Why sixth:** equipment meaningfully modifies existing combat/quest systems.

**Implement**
- Equipment inventory and slot assignment.
- Character-specific restrictions + universal accessory policy.
- Stat aggregation pipeline integration.

**Done when**
- Illegal equips are blocked by data-driven restrictions.
- Effective stats update consistently across systems.

### 7) Content expansion

**Why seventh:** add scale after stable systems are proven.

**Implement**
- Expand content packs (characters, monsters, areas, quests, equipment, passives).
- Add balancing passes via data tables only.
- Add lightweight content validation scripts (ID uniqueness, reference checks).

**Done when**
- New content can be added by editing `src/content/` modules with minimal engine changes.

### 8) Crafting hooks only

**Why eighth:** keep forward compatibility without fake-complete mechanics.

**Implement**
- Event and data hooks for future materials and recipe systems.
- Reserved inventory categories and reward emitter interfaces.

**Explicitly do not implement yet**
- Recipe UX, stations, production loops, or tuned crafting economy.

**Done when**
- Existing systems can emit/hold future crafting inputs without schema refactor.

---

## Simple tradeoffs for a new developer

- **Why object data modules?** They are easy to read, diff, and expand. You can add one character by adding one object entry.
- **Why versioned saves early?** Save compatibility bugs are hard to fix later; early migrations reduce risk.
- **Why keep systems separate?** Smaller files are easier to debug, and one system change is less likely to break everything.
- **Why delay equipment/crafting?** Core loops (state, roster, passive, combat) must be stable before adding more multipliers and dependencies.

---

## Ambiguities and concise clarifications (April 20, 2026)

These notes flag requirements that are currently too vague to implement safely without assumptions.

1. **“No clicker-centric core loop” needs acceptance criteria.**
   - Clarification proposal: “No primary progression action should require repeated manual clicking more than once every 30 seconds; all core loops must progress via passive ticks.”
2. **Crafting “hooks-only” scope lacks a minimum data contract.**
   - Clarification proposal: “Hook phase must include save schema placeholders for materials + recipes + stations, plus at least one UI panel that displays hook state.”
3. **Content-module boundaries are described, but ownership of cross-domain constants is unclear.**
   - Clarification proposal: “Shared enums/taxonomies (resource categories, stat keys, reward types) should live in `src/content/` modules named by domain and be imported by systems.”
4. **Roadmap references `saveLoad.js` + localStorage while runtime currently uses IndexedDB wrapper.**
   - Clarification proposal: “Persistence layer may use IndexedDB + localStorage metadata as long as save payload remains JSON-serializable and export/import remains localStorage-compatible.”
5. **Docs mention planned systems (gacha/quest/crafting) in mixed maturity levels.**
   - Clarification proposal: “Each planned system section should include one maturity label: `planned`, `hooked`, or `implemented` to reduce misreads during feature work.”
