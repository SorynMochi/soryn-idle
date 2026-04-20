# Bug Audit — April 20, 2026

This audit covers the current implementation under `src/` plus supporting docs and shell files. It is focused on bugs and correctness risks only (no feature additions).

## Audit method

- Read architecture and data-model docs to infer intended behavior.
- Read runtime implementation in `src/core`, `src/systems`, `src/persistence`, `src/ui`, and related content modules.
- Ran available static runtime checks (`node --check` on all JS files under `src/` and `app.js`).
- Browser smoke test could not be performed in this environment because no browser automation tool is available in-session.

---

## Prioritized findings

## 1) Save normalization can crash on partially corrupted top-level objects
- **Severity:** Critical
- **Suspected cause:** `normalizeState` assumes merged branches like `airshipQuests`, `ui`, `currencies`, `inventory`, `crafting`, `roster`, and `combat` are always objects after merge. If a save has `null` for any of these keys (valid JSON but invalid shape), deep merge preserves `null` and subsequent nested property access throws.
- **Affected files:**
  - `src/core/gameState.js`
- **How to reproduce / verify:**
  1. Save state once.
  2. Corrupt persisted JSON so `airshipQuests` or `ui` is `null`.
  3. Reload app.
  4. Observe crash during `normalizeState` nested accesses.
- **Recommended fix strategy:**
  - Add robust per-branch guards before nested access (e.g., rehydrate `merged.airshipQuests = isObject(...) ? ... : base.airshipQuests`).
  - Add schema migration/validation stage before normalization.
  - Fail soft: salvage known-good sections and reset only corrupted branches.

## 2) Currency state has duplicate sources and can silently desync
- **Severity:** High
- **Suspected cause:** Both `state.economy` and `state.currencies` represent Gil/Shards. Multiple systems mutate `economy`, and `normalizeState` always overwrites `currencies` from `economy`, making `currencies` effectively derived but still mutable and persisted as a second source.
- **Affected files:**
  - `src/core/gameState.js`
  - `src/systems/combatSystem.js`
  - `src/systems/airshipQuestSystem.js`
  - `src/ui/render.js`
- **How to reproduce / verify:**
  1. Load with manually edited save where `economy.shards` and `currencies.crystalShards` differ.
  2. Reload app.
  3. Observe `currencies` forcibly replaced by floored `economy` values regardless of prior `currencies` value.
- **Recommended fix strategy:**
  - Choose one canonical source (`currencies` *or* `economy`) and remove the duplicate.
  - Migrate old saves once during normalization.
  - Ensure all systems read/write only the canonical branch.

## 3) Offline progress is not applied despite documented hook and runtime field
- **Severity:** High
- **Suspected cause:** `calculateOfflineProgress` exists but is never called in bootstrap or game loop; `runtime.lastOfflineDurationMs` is never updated.
- **Affected files:**
  - `src/systems/offlineProgress.js`
  - `src/main.js`
  - `src/core/gameLoop.js`
- **How to reproduce / verify:**
  1. Start app, close tab for several minutes, reopen.
  2. Observe no offline summary event, no reward deltas, and `lastOfflineDurationMs` unchanged.
- **Recommended fix strategy:**
  - Call offline progress once after load/normalize and before loop start.
  - Clamp by `GAME_CONFIG.offline.maxMs` and simulate with `offline.stepMs`.
  - Persist `meta.lastActiveAt` on successful save and update runtime metrics when applying offline catch-up.

## 4) Combat ignores equipment and computed final stats
- **Severity:** High
- **Suspected cause:** `resolveBattle` aggregates `member.baseStats` instead of `member.finalStats`; equipment system and party stat calculations are bypassed in battle outcomes.
- **Affected files:**
  - `src/systems/combatSystem.js`
  - `src/systems/partySystem.js`
- **How to reproduce / verify:**
  1. Equip high-ATK gear on active member.
  2. Compare Party tab combined ATK increase vs combat results over time.
  3. Observe combat performance unchanged by equipment because combat uses base stats.
- **Recommended fix strategy:**
  - Use `finalStats` for combat aggregation.
  - Add deterministic unit tests around damage deltas with and without gear.

## 5) Gacha spending can fail after currency deduction when content tier has no entries
- **Severity:** High
- **Suspected cause:** `performPull` deducts shards before validating the rolled tier has available characters; if a tier table is misconfigured/empty, player loses currency and receives error.
- **Affected files:**
  - `src/systems/recruitmentSystem.js`
  - `src/content/characterTiers.js`
  - `src/content/characters.js`
- **How to reproduce / verify:**
  1. Temporarily make one tier weight non-zero but remove characters for that tier.
  2. Pull until that tier is rolled.
  3. Observe shards deducted with `{ ok: false }` result.
- **Recommended fix strategy:**
  - Pre-validate active pool before spend, or refund on failure.
  - Add content validation preventing weighted empty tiers.

## 6) Recruit tab is a dead UI path (no pull actions wired)
- **Severity:** High
- **Suspected cause:** `recruitmentSystem` is implemented but not registered in system manager (not required for updates) and, critically, no recruit button/listeners invoke `performPull`.
- **Affected files:**
  - `src/ui/render.js`
  - `src/main.js`
  - `src/systems/recruitmentSystem.js`
- **How to reproduce / verify:**
  1. Open Recruit tab.
  2. Observe static note and no controls to spend shards or pull.
- **Recommended fix strategy:**
  - Add minimal recruit UI intent wiring for pull action and result display.
  - Keep roll logic in system layer; UI should dispatch intents only.

## 7) Passive controls are dead UI paths (unlock/upgrade/select unavailable)
- **Severity:** Medium
- **Suspected cause:** passive generation runs automatically for currently selected category, but no UI controls call `selectCategory`, `tryUnlockCategory`, or `tryUpgradeCategory`.
- **Affected files:**
  - `src/ui/render.js`
  - `src/main.js`
  - `src/systems/passiveSystem.js`
- **How to reproduce / verify:**
  1. Open Passive tab.
  2. Observe no route selection, unlock, or upgrade interactions.
- **Recommended fix strategy:**
  - Expose passive category cards/buttons with intent handlers.
  - Enforce affordability and unlock states in system methods only.

## 8) Autosave error path is unhandled and can break loop continuity
- **Severity:** Medium
- **Suspected cause:** `frame` awaits `onAutosave` without try/catch; IndexedDB/localStorage failures can reject and break requestAnimationFrame chain for subsequent frames.
- **Affected files:**
  - `src/core/gameLoop.js`
  - `src/persistence/indexedDb.js`
  - `src/persistence/saveRepository.js`
- **How to reproduce / verify:**
  1. Simulate IndexedDB failure (private mode / blocked storage / quota issues).
  2. Trigger dirty autosave window.
  3. Observe unhandled rejection risk and loop instability.
- **Recommended fix strategy:**
  - Wrap autosave await in try/catch inside loop.
  - Emit status warning and keep loop alive.
  - Consider retry/backoff and dirty flag preservation when save fails.

## 9) Save/load lacks fallback when IndexedDB unavailable; metadata-only writes can still throw
- **Severity:** Medium
- **Suspected cause:** persistence assumes IDB availability and localStorage access with no fallback branch.
- **Affected files:**
  - `src/persistence/indexedDb.js`
  - `src/persistence/saveRepository.js`
- **How to reproduce / verify:**
  1. Run in environment blocking IDB or localStorage access.
  2. Bootstrap/load/save fails without graceful degradation.
- **Recommended fix strategy:**
  - Add storage capability detection.
  - Fallback to localStorage snapshot or in-memory mode with user-visible warning.

## 10) Party management actions are partially dead from UI (no assign/remove controls)
- **Severity:** Medium
- **Suspected cause:** `partySystem.assign/remove` exist, but Party tab currently renders read-only summary and roster list.
- **Affected files:**
  - `src/ui/render.js`
  - `src/main.js`
  - `src/systems/partySystem.js`
- **How to reproduce / verify:**
  1. Open Party tab.
  2. Observe no controls to change active slots despite support in system layer.
- **Recommended fix strategy:**
  - Add slot assignment/removal UI actions.
  - Call `partySystem.normalize` after mutations to enforce constraints.

## 11) Config mismatch: `GAME_CONFIG.offline` values are currently unused
- **Severity:** Low
- **Suspected cause:** offline constants exist but are not consumed by any flow.
- **Affected files:**
  - `src/config/constants.js`
  - `src/systems/offlineProgress.js`
  - `src/main.js`
- **How to reproduce / verify:**
  - Static inspection shows no references to `GAME_CONFIG.offline.maxMs` or `stepMs`.
- **Recommended fix strategy:**
  - Implement offline simulation using these constants or remove until needed.

## 12) Legacy duplicate app entrypoints risk confusion during future changes
- **Severity:** Low
- **Suspected cause:** both `app.js` + top-level `game/` and `src/main.js` exist; active HTML uses `src/main.js`, but legacy code remains and could diverge.
- **Affected files:**
  - `app.js`
  - `game/*`
  - `index.html`
- **How to reproduce / verify:**
  - Static inspection: `index.html` imports `src/main.js`; legacy app path is unused but present.
- **Recommended fix strategy:**
  - Document legacy status explicitly (or remove obsolete runtime path after migration).

---

## Focus-area coverage mapping

- **Save/load behavior:** Findings #1, #2, #9.
- **Autosave behavior:** Finding #8.
- **Offline progress handling:** Findings #3, #11.
- **Gacha pull logic/currency spending:** Findings #2, #5, #6.
- **Party assignment/combined stats:** Findings #4, #10.
- **Passive system tick behavior:** Finding #7 (controls) and partial architecture note in #11.
- **Combat tick behavior:** Finding #4.
- **Streak progression/reset behavior:** audited; no critical reset bug found in current path.
- **Combat/passive concurrency:** both tick concurrently as intended; no direct race in single-thread model, but gaps above still affect correctness.
- **Defeat logging:** audited; bounded history and round capture appear stable.
- **localStorage corruption/missing-field risks:** Findings #1 and #9.
- **Broken navigation/dead UI actions:** Findings #6, #7, #10.
- **Undefined/null access risks:** Finding #1.
- **Duplicate state sources:** Finding #2.
- **Hardcoded balancing constants in UI logic:** not currently a major issue; most balancing remains in content/system modules.

---

## Checks run

- `node --check` across all `src/**/*.js` files and `app.js` — pass.

