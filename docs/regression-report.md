# Regression Report — 2026-04-20

## Scope
Regression pass focused on post-fix verification for these surfaces:

- Save/load persistence round-trip.
- Autosave trigger behavior.
- Gacha shard spending and character award flow.
- Party assignment and combined party stat aggregation.
- Passive progression updates.
- Combat resolution behavior.
- Streak growth and reset behavior.
- Defeat history logging.
- UI tab navigation render path.
- Runtime-flow smoke check for newly introduced errors.

## Execution method
A deterministic Node harness was executed against the `src/` runtime modules with lightweight browser API mocks (`localStorage`, `performance`, `requestAnimationFrame`, and IndexedDB-fallback path). This validates engine/system correctness without adding features or altering gameplay logic.

Command used:

```bash
node --input-type=module <<'EOF'
# (inline harness exercising save/load, autosave, gacha, party/totals,
# passive progression, combat/streak/defeat logging, and UI render navigation)
EOF
```

Observed output:

```text
Regression checks passed: save/load, autosave, gacha/party/totals, passive, combat/streak/defeat logs, ui/render
```

## Results

### 1) Save/Load still working
- `saveState` persisted state via fallback storage path when IndexedDB is unavailable in the harness.
- `loadState` restored the same roster instance data.
- Save metadata key (`lastSavedAt`) was updated.

Result: **PASS**.

### 2) Autosave still working
- `createGameLoop` was run with an accelerated autosave interval.
- Dirty state was marked via `onStep` and autosave callback executed after interval elapsed.

Result: **PASS**.

### 3) Gacha spending and awarding correctly
- `recruitmentSystem.performPull` consumed exactly one pull cost (10 shards).
- Pull produced a valid recruited character instance and updated roster.

Result: **PASS**.

### 4) Party assignment still works
- Recruited bench unit was assigned into an empty party slot via `partySystem.assign`.

Result: **PASS**.

### 5) Combined party stats still update correctly
- `partySystem.getPartyTotals` returned non-zero aggregate combat stats after party composition updates.

Result: **PASS**.

### 6) Passive systems still progress correctly
- `passiveSystem.selectCategory('mining')` succeeded.
- `passiveSystem.update` over elapsed delta increased passive resources.

Result: **PASS**.

### 7) Combat still resolves correctly
- `combatSystem.update` processed combat ticks and appended combat log entries.

Result: **PASS**.

### 8) Streak growth and reset still behave correctly
- Victory path increased streak.
- Defeat path reset streak fields (`streak`, `streakExp`, `streakGil`) to zero.

Result: **PASS**.

### 9) Defeat logs still populate correctly
- Defeat path appended an entry in `combat.defeatHistory` including round details.

Result: **PASS**.

### 10) UI navigation still works
- `render` + `setActiveTab` were exercised across all tabs:
  - `overview`, `party`, `recruit`, `passive`, `combat`, `quests`, `inventory`, `crafting`.
- No runtime exceptions occurred during tab changes/render flow.

Result: **PASS**.

### 11) No newly introduced console/runtime flow errors
- Harness completed with no thrown assertions/exceptions.
- No new regression symptoms were observed in validated flows.

Result: **PASS**.

## Remaining issues
No regressions or clear correctness issues were identified in this pass.

## Conclusion
No code fixes were required from this regression check. Only this report was updated to document what was validated and the outcomes.

---

## Addendum — 2026-04-20 (Tab reversion hotfix)

### Issue observed
- With the live game loop running, selecting non-combat tabs could be reverted by the next render tick, forcing navigation back to `Combat`.

### Root cause summary
- Tab-change logic replaced the root store state object, while the game loop retained the original state reference captured at bootstrap.
- Subsequent loop-driven renders used stale `ui.activeTab` from the old object.

### Fix summary
- Tab changes now mutate `state.ui.activeTab` on the shared game-loop state object rather than replacing the root state reference.

### Verification
- Re-ran static syntax check and a focused state-reference smoke script that simulates tab changes while the loop-adjacent state reference remains active.
- Confirmed `ui.activeTab` persists as selected across repeated reads/renders.

---

## Addendum — 2026-04-20 (UI interaction reset hotfix)

### Issue observed
- Dropdown/select controls could close immediately while open during live gameplay.
- Combat defeat-history `<details>` cards would collapse on periodic refresh.

### Root cause summary
- Loop rendering rebuilt panel DOM every simulation tick, which recreated interactive controls while the player was still focused on them.
- `<details>` open state was not restored after full panel re-render.

### Fix summary
- Periodic render moved to the loop `onRender` callback.
- Added deferred-render coordination that pauses non-forced renders during active form interaction and flushes once interaction ends.
- Added stable defeat-card keys and restoration of previously open combat-history cards.

### Verification
- Opened all in-game select/dropdown controls while combat loop remained active; controls no longer close instantly.
- Expanded defeat-history cards and confirmed they remain open across subsequent periodic renders.
