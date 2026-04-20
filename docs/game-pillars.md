# Game Pillars

This document captures the intended feel and major systems for the project so implementation choices stay consistent.

## Pillar 1: Idle-first, not clicker-first

- The core loop progresses automatically through timed ticks.
- Clicking may support management actions, but clicking is never the primary source of power.
- A single combat tick starts at 5 seconds and resolves one full battle.
- Systems should reward planning, composition, and long-horizon progression.

## Pillar 2: Nostalgic JRPG identity

- The presentation should feel like a sincere tribute to classic/PS2-era Final Fantasy energy (FF4–FF13 inspiration).
- Names for characters, monsters, summons/espers, areas, and items should feel authentic to that style.
- Tone target: adventurous, dramatic, and nostalgic — not parody or meme-forward.

## Pillar 3: Deep parallel progression

- Multiple progression vectors should run together:
  - Auto-combat
  - Passive work (mining/chopping/gathering/studying/training)
  - Timed quests (airship dispatch)
  - Roster growth via gacha recruitment
- The player should make tradeoffs between systems instead of following a single dominant path.

## Pillar 4: Roster and party strategy over twitch skill

- Start state:
  - 1 lowest-tier character
  - 100 Gil
  - Crystal Shards for 3 gacha pulls
- Characters are recruited via weighted rarity tiers:
  - Common, Uncommon, Rare, Epic, Legendary
- Combat uses a 1–4 character party with auto-battle resolution.
- Party-facing UI stats represent combined totals of active members plus equipment.
- Character identity matters through passive specialties and gear compatibility rules.

## Pillar 5: Meaningful risk/reward loops

- Areas generate endless randomized monsters.
- Win streaks are a central growth mechanic:
  - Wins increase streak count.
  - Streak improves level/stat/EXP/Gil rewards by percentage.
  - Full party defeat resets streak automatically.
- Each location has a soft cap where reward growth stops scaling up.
- Post-soft-cap play still matters for achievements and long-term goals.

## Pillar 6: Clear simulation feedback

- Combat results should be visible in a chat-style rolling log.
- The game should retain the last 10 defeats with detailed battle logs and streak metrics.
- Time-based systems (combat ticks, passive jobs, quests) must communicate status clearly and consistently.

## Pillar 7: Data-driven architecture

- Engine logic and content data should stay separate:
  - Engine: simulation rules, timing, resolution pipelines.
  - Content: characters, monsters, tiers, rewards, areas, quests, names.
- This separation enables faster balancing and safer expansion.
- Crafting is intentionally undefined at design level; only add architecture hooks until the full design is approved.
