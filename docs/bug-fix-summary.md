# Bug Fix Summary — April 20, 2026

This update continues from the previous PR and addresses the remaining unresolved items from `docs/bug-audit.md` in severity order, with minimal bug-fix scope only.

## Resolved in this pass

## Runtime boot reliability

### 0) App appears stuck on initial “Booting shell...” message
- **How reproduced:** Opened the game entrypoint over `file://` in a browser and observed the footer never moved past the initial boot status.
- **Root cause:** ES module boot (`src/main.js`) may be blocked by browser security when loaded from `file://`, which prevents bootstrap from running at all. Additionally, fatal bootstrap errors only reached console output and did not update the on-screen status line.
- **Exact change made:**
  - Added a pre-module runtime protocol guard in `index.html` that explains when boot is blocked by `file://` usage.
  - Hardened the bootstrap error handler in `src/main.js` to report fatal initialization errors directly in the status line.
  - Updated README run instructions to use a local HTTP server instead of opening `index.html` directly.
- **How to verify now:**
  1. Open `index.html` directly with a `file://` URL.
  2. Confirm footer shows an explicit “run from local web server” message.
  3. Serve via `python3 -m http.server 4173` and open `http://localhost:4173`.
  4. Confirm game progresses past boot messaging.

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


## UI navigation state consistency

### 8) Tab selection immediately reverted to Combat
- **How reproduced:** During live runtime with the game loop active, clicked any non-combat tab (for example `Party`) and observed the panel switch for one render, then snap back to `Combat` on the next tick.
- **Root cause:** Tab clicks used `store.update` with immutable replacement, creating a brand-new root state object. The game loop still referenced the original object captured during bootstrap, so each loop render continued to read the stale `ui.activeTab` (`combat`) and overwrote the visible tab selection.
- **Related issue discovered:** Any event path relying on the replaced store state could diverge from systems still mutating the original game-loop state object, creating split-brain UI/runtime behavior.
- **Exact change made:** Updated tab click handling in `src/main.js` to mutate `state.ui.activeTab` on the existing shared state object (`store.getState()`), preserving reference identity with the game loop.
- **How to verify now:**
  1. Start the game and wait for active combat ticks.
  2. Click `Overview`, `Party`, `Recruit`, `Passive`, `Quests`, `Inventory`, and `Crafting`.
  3. Confirm each tab remains selected without being forced back to `Combat` on subsequent loop renders.

## UI interaction state stability

### 9) Dropdowns, selects, and expandable UI cards were continuously reset during gameplay
- **How reproduced:** With auto-combat running, opened interactive controls (party slot select, quest crew select, combat-area select, equipment select, and defeat-history `<details>` cards). Controls were re-created by loop-driven rendering and immediately collapsed/lost focus.
- **Root cause:** The game loop called `render` from `onStep` every tick (~100ms), rebuilding panel `innerHTML` while the player was interacting. This recreated form controls and `<details>` nodes before user interaction could complete.
- **Related issue discovered:** Defeat-history cards did not preserve expanded/collapsed state across normal periodic re-renders.
- **Exact change made:**
  - Moved periodic UI rendering from `onStep` to `onRender`, reducing unnecessary redraw pressure.
  - Added a UI render coordinator that defers non-forced renders while interactive elements are focused/active (`select`, `input`, `textarea`, active buttons/summaries), then flushes pending renders after interaction ends.
  - Added defeat-history state persistence by stamping each combat history `<details>` node with a stable key and restoring open cards after re-render.
  - Updated all UI event handlers to force immediate render after intentional player actions so feedback remains responsive.
- **How to verify now:**
  1. Start auto-combat and open each select/dropdown in Party, Combat, Quests, and Inventory.
  2. Confirm each dropdown remains open while focused instead of immediately closing.
  3. Expand one or more defeat-history cards and wait for several loop renders.
  4. Confirm expanded cards remain open until manually collapsed.

## Still remaining

- No additional unresolved bugs from the April 20, 2026 audit remain open after this pass.

## Addendum — April 20, 2026 (playtest fixes: render stability, inventory restructure, progression, combat scaling)

### 10) UI elements flickered/reset during normal play (text selection dropped, controls blinked, scroll position jumped)
- **How reproduced:** With periodic rendering active, selected text in any panel and watched selection clear immediately; scrolled long panels and saw jumpy behavior on re-render.
- **Root cause:** Non-forced loop rendering continued to rebuild panel DOM while text selection and scroll interactions were in progress.
- **Exact change made:**
  - Expanded render-interaction detection in `src/main.js` to treat active text selections as an in-progress interaction.
  - Added per-panel scroll position preservation across each render pass so long lists do not jump.
- **How to verify now:**
  1. Select text in Overview/Combat logs and wait through multiple render intervals.
  2. Confirm the selection remains until manually cleared.
  3. Scroll Inventory/Quest panels and confirm scroll does not reset from background renders.

### 11) Inventory equip dropdown defaulted to "Unequip" and prevented actual unequip flow
- **How reproduced:** Equip an item, reopen the dropdown, and observe the control often defaulting to `Unequip` despite gear still being equipped; selecting `Unequip` sometimes did nothing.
- **Root cause:** Equipped items were filtered out of options when inventory count reached zero, leaving no selected option and causing the browser to auto-select the first (`Unequip`) option without a state change event.
- **Exact change made:**
  - Updated `equipmentSystem.getEquipOptions` to include the currently equipped item even if inventory count is zero.
  - Updated inventory slot rendering to explicitly mark the empty option selected only when the slot is actually empty.
  - Restructured Inventory panel sections into clearer **Armory Stock** and **Loadout Management** blocks, including per-slot equipped-name visibility.
- **How to verify now:**
  1. Equip a weapon from quantity `1`.
  2. Re-open the same slot and confirm the equipped weapon remains selected.
  3. Choose `Unequip` and confirm item returns to inventory and slot shows `Empty`.

### 12) Character levels/stats did not progress despite EXP gains
- **How reproduced:** Win repeated combats and inspect roster; no visible unit levels and no growth in combat stats.
- **Root cause:** Combat rewards were only granted to `hero.xp`; recruited roster instances had level/exp fields but no gain path or level-up processing, and combat/party views did not expose progression fields.
- **Exact change made:**
  - Combat victories now grant EXP to active party instances.
  - Added roster leveling in `progressionSystem` with per-level EXP thresholds.
  - Added save normalization defaults for roster `level`, `exp`, and `expToNext`.
  - Party and Inventory views now display character level + EXP, and party stat computation now uses level-scaled base stats before equipment bonuses.
- **How to verify now:**
  1. Run auto-combat for several wins.
  2. Open Party/Inventory and confirm active units gain EXP and level.
  3. Confirm displayed ATK/DEF/etc. increase over level progression.

### 13) Monster difficulty stopped scaling after soft cap
- **How reproduced:** Push streak past area soft cap and observe monster level/stats flatten at cap.
- **Root cause:** One capped streak value was reused for both rewards and monster stat scaling.
- **Exact change made:** Split scaling into two tracks:
  - **Monster power/level:** uses uncapped streak (continues rising).
  - **EXP/Gil rewards:** remains capped at area soft cap.
- **How to verify now:**
  1. Push a combat streak above area soft cap.
  2. Confirm monster level continues to increase each battle.
  3. Confirm EXP/Gil values stop increasing once cap is reached.
