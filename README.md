# Soryn Idle (Foundation Shell + State Engine)

A browser-based idle JRPG foundation built with plain HTML, CSS, and JavaScript.

## Current scope

This milestone delivers the app shell and persistence/state scaffolding, intentionally **without** full combat or passive simulation.

### Implemented

- Top-level tabbed shell:
  - Overview
  - Party
  - Recruit
  - Passive
  - Combat
  - Quests
  - Inventory
- Central state store (`src/core/store.js`)
- Initial player seed state:
  - 100 Gil
  - Crystal Shards for 3 pulls
  - 1 starter Common-tier character
- Save/load via IndexedDB plus localStorage metadata
- Autosave every 10 seconds
- Offline-time calculation hook (placeholder summary only)
- Seed sample content modules for roster and quests

## Run

Open `index.html` in a modern browser.

## Architecture notes

- **Core logic** lives under `src/core/` (state + store).
- **Content data** lives under `src/content/` (roster, quests).
- **Persistence** lives under `src/persistence/` (IndexedDB repository with localStorage pointers).
- **Future simulation hooks** live under `src/systems/`.
- **UI rendering** lives under `src/ui/`.
- `index.html` boots `src/main.js` as the active runtime entrypoint.
- Top-level `app.js` plus `game/` are legacy references retained for migration history and should not be used for new fixes.

This structure keeps systems composable and avoids hardcoding one-off flows while systems are still in scaffold stage.
