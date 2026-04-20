# MVP Technical Plan (Current Foundation)

## Core direction for this milestone

This pass now includes a **combat MVP** running in parallel with passive generation.
The implementation keeps formulas simple and data-driven so balancing can expand safely.

## Delivered architecture

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
   ├─ content/
   │  ├─ combatAreas.js
   │  ├─ characters.js
   │  └─ passiveActions.js
   ├─ core/
   │  ├─ gameLoop.js
   │  ├─ gameState.js
   │  └─ store.js
   ├─ systems/
   │  ├─ combatSystem.js
   │  ├─ passiveSystem.js
   │  └─ progressionSystem.js
   └─ ui/
      └─ render.js
```

## Combat MVP scope

- Automatic combat resolves once every **5 seconds** (`combat.tickMs = 5000`).
- One combat tick is one full battle resolution.
- Battles run endlessly in the selected area.
- Monsters are seeded per area and randomized from area pools.
- Monster level, stats, and EXP/Gil rewards scale by streak progression.
- Each area has a soft cap where reward growth stops.
- Streak continues past soft cap for future achievement hooks.
- Party defeat auto-resets streak and combat resumes immediately.
- Combat window includes:
  - area selection,
  - battle result chat log,
  - defeat history with detailed round logs,
  - EXP/Gil earned for the failed streak,
  - EXP/hour and Gil/hour snapshots.

## State-first design

- Single serializable game state root in `src/core/gameState.js`.
- Combat history is bounded (recent chat + last 10 defeats) to keep save payload manageable.
- Seeded RNG (`meta.rngSeed`) drives monster randomization deterministically.

## Persistence plan

- IndexedDB stores full save payload.
- localStorage tracks active slot and save metadata.
- Autosave runs every 10 seconds.
- Save runs on `visibilitychange` and `beforeunload` as best effort.

## Non-goals in this pass

- No animation-heavy combat presentation.
- No equipment-based combat formulas yet.
- No finalized crafting mechanics (hooks only).
