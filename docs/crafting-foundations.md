# Crafting Foundations (Hook Phase)

Last updated: April 20, 2026.

This phase intentionally adds **forward-compatible structure only**. It does **not** implement recipe gameplay loops yet.

## Implemented foundations

- Save schema now reserves:
  - `inventory.materials` for future crafting inputs.
  - `crafting` block for known recipe IDs, station placeholders, queue placeholders, and prototype UI state.
- Resource definitions now include category metadata so recipe logic can query categories later instead of hardcoding IDs.
- Passive-generation resources that are categorized as crafting materials (ore/timber/herbs) now mirror into `inventory.materials`.
- Character passive specialties now expose crafting sub-hooks:
  - `craftingQuality`
  - `craftingEfficiency`
  - `craftingYield`
- Crafting UI tab shows:
  - tracked material categories
  - current hook multipliers from active party specialties
  - explicit “pending design decisions” list

## Intentionally not designed yet

- Final recipe data schema (cost arrays, gating fields, outputs, rarity encoding).
- Whether crafting is instant, queued, time-based, or station-limited.
- Failure/success curve and quality tier math.
- Salvage/recycle loops.
- Economy tuning for material sinks and output value.
- Unlock path (hero level, quests, stations, passives, or mixed model).
- How automated crafting should interact with idle/offline simulation.

## Safety intent

The current hooks are designed so future crafting systems can be added without disruptive save migrations for core inventory categories.
