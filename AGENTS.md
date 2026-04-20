# AGENTS.md

## Project guidance (repo-wide)

- Build and maintain this as a **browser-based idle JRPG** with deep progression and **no clicker-centric core loop**.
- Tech constraints: **HTML, CSS, vanilla JavaScript**, with save data designed around **localStorage-compatible persistence** (no external runtime requirements for players).
- Keep the tone **authentic, nostalgic, and earnest** with Final Fantasy IV–XIII-inspired naming/flavor; avoid parody/comedic framing.
- Separate **engine logic** from **content data**:
  - Put reusable simulation/runtime logic in `src/core/` and `src/systems/`.
  - Put balancing tables, names, loot pools, and encounter definitions in dedicated content modules.
- Prefer extending the `src/` architecture; treat top-level `game/` files as legacy unless a task explicitly targets them.
- Combat, passive actions, quests, and gacha should be designed as parallel, composable systems rather than one-off hardcoded flows.
- Treat crafting as a planned but intentionally undefined system: add hooks/interfaces only, not fake-final mechanics.
- Keep docs in `docs/` aligned with implemented behavior whenever project direction changes.
