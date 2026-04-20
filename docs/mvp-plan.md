# MVP Technical Plan (Current Foundation)

## Core direction for this milestone

This pass focuses on the **application shell + state engine** only.
Combat/passive simulations are intentionally placeholder hooks so later systems can plug in cleanly.

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
   │  ├─ roster.js
   │  └─ quests.js
   ├─ core/
   │  ├─ gameState.js
   │  └─ store.js
   ├─ persistence/
   │  ├─ indexedDb.js
   │  └─ saveRepository.js
   ├─ systems/
   │  └─ offlineProgress.js
   └─ ui/
      └─ render.js
```

## State-first design

- Single serializable game state root in `src/core/gameState.js`.
- Sections map directly to tabs (`overview`, `party`, `recruit`, `passive`, `combat`, `quests`, `inventory`).
- Initial state includes:
  - 100 Gil
  - Crystal Shards for 3 pulls
  - 1 starter Common-tier unit

## Persistence plan

- IndexedDB stores full save payload.
- localStorage tracks active slot and save metadata.
- Autosave runs every 10 seconds.
- Save runs on `visibilitychange` and `beforeunload` as best effort.

## Offline support

- Offline time is computed from `lastActiveAt`.
- Placeholder outcome summary is shown in UI.
- Reward simulation is deferred to later combat/passive system milestones.

## Non-goals in this pass

- No full combat loop.
- No passive action simulation.
- No production quest resolver.
- No crafting mechanics (hooks only).
