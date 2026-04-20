export const COMBAT_TICK_MS = 5_000;

export const COMBAT_AREAS = [
  {
    id: 'baron-outskirts',
    name: 'Baron Outskirts',
    softCapStreak: 20,
    baseLevel: 1,
    streakScalingPerWin: 0.05,
    monsters: [
      { id: 'goblin-scout', name: 'Goblin Scout', statProfile: { hp: 62, atk: 11, def: 8, spd: 10 }, rewardProfile: { exp: 20, gil: 16 } },
      { id: 'floating-eye', name: 'Floating Eye', statProfile: { hp: 56, atk: 12, def: 7, spd: 12 }, rewardProfile: { exp: 19, gil: 18 } },
      { id: 'red-bat', name: 'Red Bat', statProfile: { hp: 54, atk: 13, def: 6, spd: 13 }, rewardProfile: { exp: 18, gil: 19 } },
      { id: 'sahagin-raider', name: 'Sahagin Raider', statProfile: { hp: 68, atk: 12, def: 9, spd: 9 }, rewardProfile: { exp: 21, gil: 17 } },
      { id: 'tiny-flan', name: 'Tiny Flan', statProfile: { hp: 75, atk: 10, def: 11, spd: 7 }, rewardProfile: { exp: 22, gil: 15 } }
    ]
  },
  {
    id: 'mysidia-wood',
    name: 'Mysidia Wood',
    softCapStreak: 28,
    baseLevel: 7,
    streakScalingPerWin: 0.062,
    monsters: [
      { id: 'bomb-spark', name: 'Bomb Spark', statProfile: { hp: 100, atk: 19, def: 10, spd: 14 }, rewardProfile: { exp: 41, gil: 34 } },
      { id: 'coeurl-kit', name: 'Coeurl Kit', statProfile: { hp: 110, atk: 18, def: 12, spd: 15 }, rewardProfile: { exp: 43, gil: 35 } },
      { id: 'garuda-hatchling', name: 'Garuda Hatchling', statProfile: { hp: 96, atk: 20, def: 10, spd: 17 }, rewardProfile: { exp: 40, gil: 36 } },
      { id: 'zombie-knight', name: 'Zombie Knight', statProfile: { hp: 125, atk: 17, def: 14, spd: 10 }, rewardProfile: { exp: 45, gil: 33 } },
      { id: 'naga-scout', name: 'Naga Scout', statProfile: { hp: 104, atk: 19, def: 11, spd: 14 }, rewardProfile: { exp: 42, gil: 35 } }
    ]
  },
  {
    id: 'dali-plains',
    name: 'Dali Plains',
    softCapStreak: 36,
    baseLevel: 14,
    streakScalingPerWin: 0.072,
    monsters: [
      { id: 'mandragora', name: 'Mandragora', statProfile: { hp: 158, atk: 24, def: 16, spd: 14 }, rewardProfile: { exp: 62, gil: 48 } },
      { id: 'ochu-bloom', name: 'Ochu Bloom', statProfile: { hp: 172, atk: 23, def: 17, spd: 12 }, rewardProfile: { exp: 64, gil: 47 } },
      { id: 'worm-larva', name: 'Sand Worm Larva', statProfile: { hp: 166, atk: 25, def: 15, spd: 13 }, rewardProfile: { exp: 63, gil: 49 } },
      { id: 'ghoul-captain', name: 'Ghoul Captain', statProfile: { hp: 150, atk: 27, def: 14, spd: 15 }, rewardProfile: { exp: 61, gil: 50 } },
      { id: 'helldiver', name: 'Helldiver', statProfile: { hp: 148, atk: 26, def: 14, spd: 16 }, rewardProfile: { exp: 60, gil: 51 } }
    ]
  },
  {
    id: 'zanarkand-ruins',
    name: 'Zanarkand Ruins',
    softCapStreak: 44,
    baseLevel: 22,
    streakScalingPerWin: 0.082,
    monsters: [
      { id: 'iron-giant', name: 'Iron Giant', statProfile: { hp: 248, atk: 33, def: 24, spd: 12 }, rewardProfile: { exp: 90, gil: 68 } },
      { id: 'behemoth-cub', name: 'Behemoth Cub', statProfile: { hp: 236, atk: 36, def: 20, spd: 15 }, rewardProfile: { exp: 92, gil: 70 } },
      { id: 'malboro-bud', name: 'Malboro Bud', statProfile: { hp: 262, atk: 30, def: 23, spd: 13 }, rewardProfile: { exp: 94, gil: 67 } },
      { id: 'tonberry-stalker', name: 'Tonberry Stalker', statProfile: { hp: 228, atk: 37, def: 21, spd: 16 }, rewardProfile: { exp: 95, gil: 72 } },
      { id: 'chimera-pulse', name: 'Chimera Pulse', statProfile: { hp: 244, atk: 34, def: 22, spd: 14 }, rewardProfile: { exp: 93, gil: 69 } }
    ]
  },
  {
    id: 'archades-skyway',
    name: 'Archades Skyway',
    softCapStreak: 52,
    baseLevel: 31,
    streakScalingPerWin: 0.09,
    monsters: [
      { id: 'ahriman-lord', name: 'Ahriman Lord', statProfile: { hp: 336, atk: 44, def: 28, spd: 20 }, rewardProfile: { exp: 128, gil: 94 } },
      { id: 'phantom-armor', name: 'Phantom Armor', statProfile: { hp: 360, atk: 42, def: 31, spd: 16 }, rewardProfile: { exp: 130, gil: 90 } },
      { id: 'flan-prince', name: 'Flan Prince', statProfile: { hp: 348, atk: 40, def: 33, spd: 15 }, rewardProfile: { exp: 132, gil: 88 } },
      { id: 'coeurl-rex', name: 'Coeurl Rex', statProfile: { hp: 322, atk: 46, def: 27, spd: 21 }, rewardProfile: { exp: 127, gil: 96 } },
      { id: 'chimera-brain', name: 'Chimera Brain', statProfile: { hp: 334, atk: 45, def: 29, spd: 19 }, rewardProfile: { exp: 129, gil: 93 } }
    ]
  },
  {
    id: 'pulse-steppe',
    name: 'Pulse Steppe',
    softCapStreak: 60,
    baseLevel: 40,
    streakScalingPerWin: 0.097,
    monsters: [
      { id: 'cie-thorn', name: 'Cie\'th Thorn', statProfile: { hp: 432, atk: 55, def: 35, spd: 24 }, rewardProfile: { exp: 168, gil: 124 } },
      { id: 'adamantoise-young', name: 'Young Adamantoise', statProfile: { hp: 500, atk: 50, def: 42, spd: 14 }, rewardProfile: { exp: 176, gil: 118 } },
      { id: 'behemoth-king', name: 'Behemoth King', statProfile: { hp: 458, atk: 58, def: 34, spd: 22 }, rewardProfile: { exp: 172, gil: 126 } },
      { id: 'juggernaut-core', name: 'Juggernaut Core', statProfile: { hp: 470, atk: 53, def: 39, spd: 18 }, rewardProfile: { exp: 174, gil: 122 } },
      { id: 'cactuar-warden', name: 'Cactuar Warden', statProfile: { hp: 398, atk: 61, def: 31, spd: 28 }, rewardProfile: { exp: 170, gil: 129 } }
    ]
  },
  {
    id: 'lunatic-pandora',
    name: 'Lunatic Pandora',
    softCapStreak: 68,
    baseLevel: 50,
    streakScalingPerWin: 0.106,
    monsters: [
      { id: 'ultima-weapon', name: 'Ultima Weapon Echo', statProfile: { hp: 620, atk: 70, def: 46, spd: 24 }, rewardProfile: { exp: 232, gil: 172 } },
      { id: 'omega-frame', name: 'Omega Frame', statProfile: { hp: 648, atk: 73, def: 48, spd: 22 }, rewardProfile: { exp: 236, gil: 176 } },
      { id: 'deathgaze', name: 'Deathgaze', statProfile: { hp: 598, atk: 74, def: 42, spd: 27 }, rewardProfile: { exp: 230, gil: 180 } },
      { id: 'demon-wall', name: 'Demon Wall', statProfile: { hp: 670, atk: 69, def: 52, spd: 18 }, rewardProfile: { exp: 238, gil: 170 } },
      { id: 'anima-husk', name: 'Anima Husk', statProfile: { hp: 612, atk: 72, def: 45, spd: 23 }, rewardProfile: { exp: 234, gil: 174 } }
    ]
  },
  {
    id: 'crystal-nexus',
    name: 'Crystal Nexus',
    softCapStreak: 78,
    baseLevel: 62,
    streakScalingPerWin: 0.114,
    monsters: [
      { id: 'bahamut-prime', name: 'Bahamut Prime Shade', statProfile: { hp: 820, atk: 88, def: 56, spd: 30 }, rewardProfile: { exp: 320, gil: 240 } },
      { id: 'alexander-golem', name: 'Alexander Golem', statProfile: { hp: 900, atk: 82, def: 64, spd: 20 }, rewardProfile: { exp: 330, gil: 228 } },
      { id: 'odin-revenant', name: 'Odin Revenant', statProfile: { hp: 784, atk: 92, def: 52, spd: 34 }, rewardProfile: { exp: 326, gil: 246 } },
      { id: 'ifrit-emberlord', name: 'Ifrit Emberlord', statProfile: { hp: 808, atk: 90, def: 54, spd: 29 }, rewardProfile: { exp: 324, gil: 242 } },
      { id: 'shiva-frostwraith', name: 'Shiva Frostwraith', statProfile: { hp: 770, atk: 86, def: 50, spd: 36 }, rewardProfile: { exp: 322, gil: 248 } }
    ]
  }
];

export const COMBAT_AREAS_BY_ID = Object.fromEntries(COMBAT_AREAS.map((area) => [area.id, area]));
