# Bug Fix Summary — April 20, 2026

This pass applies only high-confidence, low-risk bug fixes from `docs/bug-audit.md`.

## Fixed

### 1) Save normalization crash on corrupted top-level branches
- **Bug:** Save normalization could throw when persisted JSON contained `null` for expected object branches.
- **Root cause:** `deepMerge` preserves `null`, and `normalizeState` then accessed nested properties without guarding each top-level branch.
- **Fix:** Added object-shape guards in `normalizeState` to safely rehydrate corrupted top-level branches (`meta`, `ui`, `economy`, `currencies`, `party`, `inventory`, `crafting`, `roster`, `combat`, `airshipQuests`, `runtime`) from base defaults when invalid. Also guarded `roster.ownedInstanceIds` and `roster.byInstanceId` before iterating.
- **Verification:** Manually load state data with `null` branches and confirm app boot no longer crashes; runtime falls back to defaults for only the invalid sections.

### 2) Combat ignored equipment/final party stats
- **Bug:** Combat math used `baseStats`, so equipment/passive-adjusted stats did not affect results.
- **Root cause:** `resolveBattle` aggregated `member.baseStats` directly.
- **Fix:** Updated aggregation to use `member.finalStats` with a safe fallback to `baseStats`.
- **Verification:** Equip ATK/DEF/SPD gear and confirm combat outcomes change in the expected direction.

### 3) Gacha pull could consume shards before validating rolled tier content
- **Bug:** Pulls deducted shards before confirming the rolled tier had a valid recruit.
- **Root cause:** Spend happened before the tier roster/character selection null-check.
- **Fix:** Moved shard deduction to occur only after a valid character is selected.
- **Verification:** With a deliberately empty weighted tier, failed pulls now return an error without shard loss.

### 4) Autosave failure path could break loop continuity
- **Bug:** Rejected autosave promises were not handled in the game loop.
- **Root cause:** `await onAutosave` in `frame` had no `try/catch`.
- **Fix:** Wrapped autosave block in `try/catch`, logs warning, preserves loop continuity, and keeps dirty state true for retry.
- **Verification:** Simulate autosave rejection and confirm frames continue and autosave retries later.

## Still unfixed (intentionally out of scope for this pass)

- Duplicate currency source-of-truth (`economy` vs `currencies`).
- Offline progress hook wiring and config usage.
- Recruit/Passive/Party dead UI actions.
- IndexedDB/localStorage capability fallback handling.
- Legacy `app.js` + `game/` cleanup.

These remain untouched to keep this pass minimal and avoid feature/UI scope expansion.
