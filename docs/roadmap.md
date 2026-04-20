# Project Roadmap

This roadmap breaks implementation into practical phases for a browser-based deep progression idle JRPG. It assumes **no clicker-first loop**, offline-friendly persistence, and a clean separation between engine code and content data.

## Guiding constraints

- Platform: browser-only, no third-party software required.
- Stack: HTML, CSS, vanilla JavaScript.
- Persistence target: localStorage-compatible save format.
- Theme layer: nostalgic Final Fantasy-style naming/flavor (FF4–FF13 era inspiration).
- Crafting: intentionally undefined for now; only build extension hooks.

---

## Phase 0 — Foundation alignment (current)

**Goal:** Ensure architecture and documentation support the intended game before adding major mechanics.

### Deliverables
- Repository-level project guidance (`AGENTS.md`) with clear guardrails.
- Design docs for game pillars and implementation phases.
- Explicit boundaries between engine modules and content modules.

### Exit criteria
- New contributors can identify where to add systems vs where to add content.
- Docs match intended product direction.

---

## Phase 1 — Core progression skeleton

**Goal:** Ship a stable baseline loop with starting resources, basic roster state, and time-based progression.

### Systems
- New run bootstrap:
  - 1 lowest-tier character.
  - 100 Gil.
  - Crystal Shards for 3 gacha pulls.
- Global tick model (starts at 5s per full battle/tick).
- Core currencies (`Gil`, `Crystal Shards`) and deterministic update cadence.
- Save/load lifecycle based on localStorage-compatible schema.

### Data/content needs
- Initial starter character pool and tier tagging.
- Early-game economy constants (reward curves, sinks).

### Exit criteria
- Fresh save always initializes correctly.
- Game can idle and progress without user clicking.

---

## Phase 2 — Recruitment + roster management

**Goal:** Implement character acquisition and party assembly as first major progression vector.

### Systems
- Gacha recruitment using weighted chances by tier:
  - Common, Uncommon, Rare, Epic, Legendary.
- Character inventory/roster model.
- Party assignment for active combat group (1–4 characters).
- Character specialty metadata scaffold (for future modifiers).

### Data/content needs
- Character tables split from simulation logic (stats, role tags, rarity).
- Pull tables and pity/protection policy (if used) stored as data.

### Exit criteria
- Pulling characters consumes shards and updates roster deterministically.
- Active party can be configured from owned characters.

---

## Phase 3 — Auto-combat loop + streak progression

**Goal:** Make combat the main non-click loop with meaningful scaling and reset pressure.

### Systems
- Area-based auto-battles against endless randomized monsters.
- Party aggregate UI stats (combined HP/MP/core stats + equipment effects).
- Streak system:
  - Wins increase streak.
  - Streak increases level/stat/EXP/Gil rewards by %.
  - Party death auto-resets streak.
- Soft cap per location where reward growth plateaus.
- Post-soft-cap support focused on achievement farming, not primary scaling.

### Data/content needs
- Monster/area data packs and randomized encounter pools.
- Reward scaling tables and soft-cap parameters.

### Exit criteria
- One tick resolves one complete battle.
- Streak behavior and soft-cap behavior are clearly observable in UI/logs.

---

## Phase 4 — Passive parallel actions

**Goal:** Add always-on non-combat progression channels that run simultaneously with combat.

### Systems
- Passive actions:
  - Mining
  - Chopping
  - Gathering
  - Studying
  - Training
- Unlockable progression tree for each passive type.
- Scheduler/state model so passive timers and combat can co-exist cleanly.

### Data/content needs
- Passive node trees and unlock costs.
- Specialty tags that influence passive throughput.

### Exit criteria
- Combat and at least one passive action can run concurrently without state corruption.
- Passive trees unlock and persist correctly.

---

## Phase 5 — Questing + airship dispatch

**Goal:** Introduce longer-form timed objectives and roster tradeoff decisions.

### Systems
- Unlockable airship quests with:
  - Timers
  - Stat requirements
  - Success chance
- Dispatch lockout: characters on quest are unavailable until return.
- Quest rewards emphasizing Crystal Shards as primary gacha income source.

### Data/content needs
- Quest catalog with requirement/reward definitions.
- Success formula coefficients in tunable data files.

### Exit criteria
- Quest dispatch meaningfully competes with combat party availability.
- Quest completion and failure are both handled in logs + rewards.

---

## Phase 6 — Equipment + role expression

**Goal:** Strengthen team-building through equipment rules and role-appropriate loadouts.

### Systems
- Equipment inventory and assignment.
- Character-specific gear restrictions.
- Universal accessory slot handling.
- Party stat aggregation including gear effects.

### Data/content needs
- Gear catalogs by slot/type/tier.
- Restriction matrices per character archetype.

### Exit criteria
- Illegal equipment assignments are prevented.
- UI totals match effective combat calculations.

---

## Phase 7 — Combat telemetry, defeat history, and UX polish

**Goal:** Improve clarity and long-session usability.

### Systems
- Chat-style battle result log for combat window.
- Defeat archive (last 10 losses) with detailed logs + streak performance metrics.
- Session summaries and progression deltas for major actions.

### Exit criteria
- Players can review recent losses and identify bottlenecks.
- Logging remains performant over long idle sessions.

---

## Phase 8 — Crafting hooks (not full crafting design)

**Goal:** Prepare for future crafting without pretending systems are finalized.

### Systems
- Define neutral interfaces/events for potential crafting inputs/outputs.
- Reserve inventory/economy schema slots for crafting materials.
- Ensure passive/quest/loot systems can emit generic material rewards.

### Explicit non-goals
- No finalized crafting recipes, stations, or loops yet.
- No hardcoded assumptions about crafting progression pacing.

### Exit criteria
- Core architecture can accept crafting modules later with minimal refactor.

---

## Phase 9 — Content expansion and balance passes

**Goal:** Scale from functional prototype to deep progression game.

### Focus areas
- Area, monster, character, and quest volume expansion.
- Mid/late-game pacing, soft-cap tuning, and reward inflation control.
- Authentic FF-style flavor pass for names, itemization tone, and encounter identity.

### Exit criteria
- Multi-day idle progression remains coherent and rewarding.
- Data-driven balancing can be adjusted without rewriting core systems.
