export const COMBAT_TICK_MS = 5_000;

export const COMBAT_AREAS = [
  {
    id: 'glass-plains',
    name: 'Glass Plains',
    softCapStreak: 25,
    baseLevel: 1,
    streakScalingPerWin: 0.055,
    monsters: [
      { id: 'shard-slime', name: 'Shard Slime', statProfile: { hp: 64, atk: 11, def: 8, spd: 9 }, rewardProfile: { exp: 22, gil: 18 } },
      { id: 'dust-wolf', name: 'Dust Wolf', statProfile: { hp: 58, atk: 13, def: 7, spd: 12 }, rewardProfile: { exp: 20, gil: 20 } },
      { id: 'copper-beetle', name: 'Copper Beetle', statProfile: { hp: 74, atk: 10, def: 10, spd: 7 }, rewardProfile: { exp: 24, gil: 16 } }
    ]
  },
  {
    id: 'moonlit-grotto',
    name: 'Moonlit Grotto',
    softCapStreak: 35,
    baseLevel: 8,
    streakScalingPerWin: 0.07,
    monsters: [
      { id: 'echo-bat', name: 'Echo Bat', statProfile: { hp: 102, atk: 17, def: 11, spd: 15 }, rewardProfile: { exp: 40, gil: 33 } },
      { id: 'marrow-hound', name: 'Marrow Hound', statProfile: { hp: 120, atk: 20, def: 12, spd: 13 }, rewardProfile: { exp: 45, gil: 36 } },
      { id: 'gloom-tortoise', name: 'Gloom Tortoise', statProfile: { hp: 150, atk: 15, def: 16, spd: 8 }, rewardProfile: { exp: 48, gil: 34 } }
    ]
  },
  {
    id: 'solar-ruins',
    name: 'Solar Ruins',
    softCapStreak: 45,
    baseLevel: 18,
    streakScalingPerWin: 0.082,
    monsters: [
      { id: 'sunscar-idol', name: 'Sunscar Idol', statProfile: { hp: 230, atk: 29, def: 21, spd: 13 }, rewardProfile: { exp: 88, gil: 64 } },
      { id: 'ember-raptor', name: 'Ember Raptor', statProfile: { hp: 192, atk: 34, def: 17, spd: 19 }, rewardProfile: { exp: 84, gil: 67 } },
      { id: 'auric-specter', name: 'Auric Specter', statProfile: { hp: 180, atk: 32, def: 18, spd: 22 }, rewardProfile: { exp: 90, gil: 70 } }
    ]
  }
];

export const COMBAT_AREAS_BY_ID = Object.fromEntries(COMBAT_AREAS.map((area) => [area.id, area]));
