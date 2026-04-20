# Bug Fix Summary — April 20, 2026

This update continues from the previous PR and addresses the remaining unresolved items from `docs/bug-audit.md` in severity order, with minimal bug-fix scope only.

## Resolved in this pass

## High severity

### 1) Duplicate currency state desync (`economy` vs `currencies`)
- **How reproduced:** Loaded a save where `economy` and `currencies` intentionally diverged, then traced runtime writes across combat/quest/normalize paths.
- **Root cause:** Runtime had two persisted currency branches, and multiple systems wrote `currencies` directly while UI/systems primarily consumed `economy`.
- **Exact change made:**
  - Treated `economy` as canonical runtime source.
  - In normalization, added numeric migration fallback so invalid/missing `economy` values can be recovered from legacy `currencies` once.
  - Removed direct `currencies` writes from combat and airship quest systems; `currencies` is now a normalized legacy mirror only.
- **How to verify now:**
  1. Save with mismatched `economy`/`currencies` values.
  2. Reload.
  3. Confirm economy is normalized consistently and combat/quest rewards only mutate `economy`.

### 2) Offline progress hook not applied + offline config unused
- **How reproduced:** Started app after setting an old `meta.lastActiveAt`; observed no offline simulation and `runtime.lastOfflineDurationMs` stayed unchanged.
- **Root cause:** Offline helper existed but was never invoked during bootstrap.
- **Exact change made:**
  - Replaced placeholder-only offline function with `calculateOfflineProgress` + `applyOfflineProgress`.
  - Wired offline application during bootstrap before loop start.
  - Consumed `GAME_CONFIG.offline.maxMs` and `GAME_CONFIG.offline.stepMs` for capped simulation.
  - Updated runtime offline duration and metadata timestamps after application.
- **How to verify now:**
  1. Set `meta.lastActiveAt` to older time in save.
  2. Reload app.
  3. Confirm resources/progression advance for capped offline time and status line reports offline application.

### 3) Recruit tab dead UI path
- **How reproduced:** Opened Recruit tab and confirmed no controls invoked recruitment logic.
- **Root cause:** UI rendered a placeholder note only; no event wiring to `recruitmentSystem.performPull`.
- **Exact change made:**
  - Added minimal recruit panel UI (single-pull button, shard cost, rates, last pull display).
  - Added click handler to execute one pull via existing system logic and status messaging.
- **How to verify now:**
  1. Open Recruit tab.
  2. Click “Perform 1 Pull” with enough shards.
  3. Confirm shards decrease, a character is added, and last pull updates.

## Medium severity

### 4) Passive controls dead UI path
- **How reproduced:** Opened Passive tab and confirmed no route selection/unlock/upgrade controls.
- **Root cause:** Passive system APIs existed but were never exposed through UI intents.
- **Exact change made:**
  - Added passive route cards with Select / Unlock / Upgrade buttons.
  - Added click handling that calls `passiveSystem.selectCategory`, `tryUnlockCategory`, and `tryUpgradeCategory`.
- **How to verify now:**
  1. Open Passive tab.
  2. Use Select/Unlock/Upgrade where affordable.
  3. Confirm selected route, gold spend, and upgrade levels update.

### 5) Party assignment/removal dead UI path
- **How reproduced:** Opened Party tab and confirmed assignment was read-only.
- **Root cause:** `partySystem.assign/remove` existed but no UI control called them.
- **Exact change made:**
  - Added per-slot assignment selects to Party tab.
  - Added change handler invoking `partySystem.assign/remove` and `partySystem.normalize`.
- **How to verify now:**
  1. Open Party tab.
  2. Change a slot to another owned character or clear it.
  3. Confirm active party list/totals update.

### 6) Save/load fallback when IndexedDB/localStorage unavailable
- **How reproduced:** Audited persistence path: IDB/localStorage errors could throw with no resilient fallback path.
- **Root cause:** Repository relied on direct IDB/localStorage calls without defensive handling.
- **Exact change made:**
  - Added safe localStorage getter/setter wrappers.
  - Added fallback load chain: IndexedDB → localStorage snapshot → in-memory map.
  - Added fallback save chain: IndexedDB, else localStorage snapshot, else in-memory clone.
  - Added snapshot key namespace in constants.
- **How to verify now:**
  1. Simulate IDB failure.
  2. Save state and reload.
  3. Confirm state persists via snapshot fallback (or memory fallback when storage blocked).

## Low severity

### 7) Legacy duplicate entrypoint confusion
- **How reproduced:** Static review showed `index.html` uses `src/main.js` while `app.js` and `game/` coexist without clear active/legacy contract.
- **Root cause:** Missing explicit documentation about active runtime entrypoint.
- **Exact change made:** Added README architecture note explicitly marking `src/main.js` as active and top-level `app.js` + `game/` as legacy/migration references.
- **How to verify now:** Read README architecture notes and confirm entrypoint guidance is explicit.

## Still remaining

- No additional unresolved bugs from the April 20, 2026 audit remain open after this pass.
