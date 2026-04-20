# MVP Technical Plan (Phased)

## 1) Technical plan for MVP

### Core experience
- The game continuously progresses without mandatory clicking.
- The hero auto-fights enemies, gains XP/gold, levels up, and increases power over time.
- The player can optionally spend gold to buy upgrades that improve progression speed.

### MVP goals
- Always-on progression loop that runs while tab is open.
- Deterministic updates based on `deltaTime` so systems stay stable.
- Persistent save/load with robust fallback behavior.
- Offline progress simulation when returning to the game.
- Clear architecture for adding future systems (crafting, quests, talents, zones).

### MVP non-goals
- Art pipeline, animation framework, multiplayer, server sync, monetization.
- Heavy balancing; only enough values to prove progression works.

### Architecture strategy
- **State-first design**: one serializable game state object.
- **System-based loop**: each progression domain is an isolated system module with a common interface.
- **Coordinator layer**: game loop orchestrates systems, rendering, and saving.
- **Persistence gateway**: single module handles IndexedDB/localStorage concerns.

---

## 2) Proposed clean file structure

```text
/
├─ index.html
├─ styles.css
├─ README.md
├─ docs/
│  └─ mvp-plan.md
└─ src/
   ├─ main.js
   ├─ config/
   │  └─ constants.js
   ├─ core/
   │  ├─ gameState.js
   │  ├─ gameLoop.js
   │  └─ systemManager.js
   ├─ persistence/
   │  ├─ indexedDb.js
   │  └─ saveRepository.js
   ├─ systems/
   │  ├─ progressionSystem.js
   │  ├─ combatSystem.js
   │  └─ upgradeSystem.js
   └─ ui/
      └─ render.js
```

Rationale:
- `core/` contains generic orchestration.
- `systems/` holds independently testable progression domains.
- `persistence/` centralizes storage policy.
- `ui/` is render-only to avoid mixing logic and DOM concerns.

---

## 3) Game state shape

```js
{
  meta: {
    version: 1,
    createdAt: number,
    updatedAt: number,
    lastActiveAt: number
  },
  hero: {
    level: number,
    xp: number,
    xpToNext: number,
    attack: number,
    maxHp: number,
    hp: number
  },
  economy: {
    gold: number,
    shards: number
  },
  world: {
    zone: number,
    kills: number,
    enemy: {
      name: string,
      hp: number,
      maxHp: number,
      attack: number,
      rewardGold: number,
      rewardXp: number
    }
  },
  upgrades: {
    attackRank: number,
    vitalityRank: number,
    automationRank: number
  },
  runtime: {
    totalPlayTimeMs: number,
    totalTicks: number
  }
}
```

Design rules:
- Keep all values serializable primitives/plain objects.
- Keep computed values optional; derive when possible.
- Add new systems with their own top-level namespace (e.g. `crafting`, `quests`).

---

## 4) Main game loop definition

### Tick cadence
- Use `requestAnimationFrame` for browser-friendly scheduling.
- Accumulate elapsed time and process fixed simulation steps (e.g. 100ms).
- Cap catch-up steps per frame to avoid spiral-of-death after tab throttling.

### Per-step pipeline
1. Build `context` with immutable config and helpers.
2. Run each system in registration order:
   - progressionSystem
   - combatSystem
   - upgradeSystem
3. Update runtime counters.
4. Mark dirty state if mutations occurred.
5. Render on a lower cadence (e.g. every 100–200ms) to reduce DOM churn.

### Why fixed-step
- More deterministic balancing.
- Easier offline simulation (just replay N fixed steps).
- Safer for future combat math and probabilistic events.

---

## 5) Save/load + offline progress definition

### Storage policy
- **IndexedDB** stores full save payload (`idleRpgSaves` database, `saves` object store).
- **localStorage** stores lightweight metadata for quick boot checks:
  - active slot key
  - last save timestamp
  - save version

### Save flow
- Autosave every 10s if dirty.
- Save on `visibilitychange` (hidden) and `beforeunload` best effort.
- Update `meta.updatedAt` and `meta.lastActiveAt` right before persist.

### Load flow
1. Read active slot from localStorage (fallback `slot-1`).
2. Load from IndexedDB.
3. Validate/normalize against current schema.
4. If missing/corrupt, create fresh state.

### Offline progress
- On boot, compare `Date.now()` with saved `lastActiveAt`.
- Clamp offline duration (e.g. max 8 hours).
- Simulate offline time with coarse fixed steps (e.g. 250ms) for performance.
- Produce summary (gold/xp gained) and show in UI.

---

## 6) Foundation implementation scope

- Implement baseline systems (progression, combat, upgrades).
- Implement fixed-step loop + autosave + render cadence.
- Implement IndexedDB repository + localStorage metadata.
- Implement lightweight UI panel showing key stats and status.
- Include extension points (`registerSystem`) so new systems can be dropped in with minimal coupling.
