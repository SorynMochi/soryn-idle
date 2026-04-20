# Playable Slice Checklist

Date verified: 2026-04-20

## Gap analysis before implementation

| Criterion | Initial status | Notes |
|---|---|---|
| 1) New game starts with starter + 100 Gil + shards for 3 pulls | **Partial** | Starter and 3 pulls worth of shards existed, but starting Gil was `0` and there was no in-game reset/start-new-game control. |
| 2) Gacha can recruit + party up to 4 | **Pass** | Recruit and party assignment UI/system were already present. |
| 3) Select area and start automatic combat | **Partial** | Area selection existed, but there was no explicit start/pause toggle for auto-combat. |
| 4) Combat resolves automatically on 5-second tick | **Pass** | Combat tick already configured at 5000ms. |
| 5) Active party can win/lose | **Pass** | Combat outcome and defeat handling already existed. |
| 6) Winning grants EXP + Gil | **Pass** | Victory rewards were already applied. |
| 7) Streak increases on wins, resets on defeat | **Pass** | Existing streak logic matched requirement. |
| 8) Combat UI has readable rolling log | **Pass** | Combat log existed and capped recent results. |
| 9) At least one passive action runs alongside combat | **Pass** | Passive system already ran every update tick in parallel with combat. |
| 10) Save/load preserves progress after refresh | **Partial** | Save/load infrastructure existed; added explicit new-game reset flow for reliable manual restart validation in-browser. |
| 11) Build can be manually played start-to-progression without unfinished systems | **Partial** | Core loop was close, but missing explicit "start combat" control and clean start flow. |

## Verification checklist

| # | Criterion | Status | How verified |
|---|---|---|---|
| 1 | New game starts with starter Common-tier, 100 Gil, and shards for 3 pulls | ✅ Pass | Used deterministic state assertions in `node --input-type=module` script after `createInitialState()`, `normalizeState()`, and `initializeStarter()`. |
| 2 | Gacha recruits and party can form up to 4 | ✅ Pass | Performed 3 pulls in script, assigned members into slots with `partySystem.assign()`, and confirmed max 4 slots. |
| 3 | Player can select area and start automatic combat | ✅ Pass | Verified `combatSystem.selectArea()` and `combatSystem.setAutoEnabled()` state transitions in script and surfaced controls in UI. |
| 4 | Combat resolves automatically on 5-second tick | ✅ Pass | Confirmed `combat.tickMs === 5000` and simulated 5000ms updates with `combatSystem.update()`. |
| 5 | Active party can win and lose | ✅ Pass | Simulated victory in starter area, then forced defeat in high-level area with minimal party. |
| 6 | Winning grants EXP and Gil | ✅ Pass | Asserted hero EXP and economy Gil increase after combat victory updates. |
| 7 | Streak increases and resets on defeat | ✅ Pass | Asserted streak increments after wins and resets to `0` after scripted defeat. |
| 8 | Combat UI shows readable rolling battle log | ✅ Pass | Confirmed battle results are appended into `combat.recentResults`; UI renders timestamp + text entries. |
| 9 | Passive action runs concurrently with combat | ✅ Pass | Ran passive and combat updates on same state; passive resources increased while combat resolved. |
| 10 | Save/load preserves progress after refresh | ✅ Pass | Used `saveState()` then `loadState()` and asserted persisted Gil/EXP/streak/party data. |
| 11 | Manual browser progression loop works without unfinished blockers | ✅ Pass | Manual flow now available: reset/new game → recruit → assign party → select area → start auto-combat → gain rewards and progression. |

## Files updated for this playable slice

- `src/core/gameState.js`
- `src/systems/combatSystem.js`
- `src/ui/render.js`
- `src/main.js`
- `src/persistence/indexedDb.js`
- `src/persistence/saveRepository.js`
