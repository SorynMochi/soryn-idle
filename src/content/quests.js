const MINUTE_MS = 60_000;

export const AIRSHIP_BOARD_UNLOCK = {
  id: 'hero_level_and_victories',
  params: {
    heroLevel: 4,
    totalVictories: 12
  }
};

export const AIRSHIP_QUESTS = [
  {
    id: 'aq-baron-scouting-flight',
    title: 'Baron Scouting Flight',
    description: 'Chart safe currents above Baron and recover drifting memory crystals.',
    durationMs: 6 * MINUTE_MS,
    maxAssignees: 2,
    unlock: { id: 'hero_level', params: { heroLevel: 4 } },
    statRequirements: { atk: 24, spd: 20 },
    rewards: {
      success: [{ type: 'gil', min: 80, max: 130 }, { type: 'shards', min: 12, max: 20 }],
      failure: [{ type: 'gil', min: 24, max: 40 }]
    }
  },
  {
    id: 'aq-mysidia-relic-run',
    title: 'Mysidia Relic Run',
    description: 'Carry wardstones from Mysidia to frontier chapels before dusk.',
    durationMs: 10 * MINUTE_MS,
    maxAssignees: 3,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 5, totalVictories: 20 } },
    statRequirements: { def: 26, res: 22, spd: 21 },
    rewards: {
      success: [{ type: 'gil', min: 160, max: 250 }, { type: 'shards', min: 16, max: 27 }],
      failure: [{ type: 'gil', min: 44, max: 84 }, { type: 'shards', min: 3, max: 6 }]
    }
  },
  {
    id: 'aq-lindblum-courier-route',
    title: 'Lindblum Courier Route',
    description: 'Escort royal courier balloons through jagged thunder corridors.',
    durationMs: 12 * MINUTE_MS,
    maxAssignees: 3,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 6, totalVictories: 30 } },
    statRequirements: { atk: 34, def: 28, spd: 25 },
    rewards: {
      success: [{ type: 'gil', min: 210, max: 310 }, { type: 'shards', min: 20, max: 33 }],
      failure: [{ type: 'gil', min: 64, max: 104 }, { type: 'shards', min: 4, max: 8 }]
    }
  },
  {
    id: 'aq-besaid-evacuation',
    title: 'Besaid Evacuation',
    description: 'Move villagers from storm-lashed shoals while fiends gather offshore.',
    durationMs: 14 * MINUTE_MS,
    maxAssignees: 3,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 7, totalVictories: 45 } },
    statRequirements: { def: 34, res: 31, spd: 27 },
    rewards: {
      success: [{ type: 'gil', min: 260, max: 390 }, { type: 'shards', min: 24, max: 38 }],
      failure: [{ type: 'gil', min: 82, max: 128 }, { type: 'shards', min: 6, max: 10 }]
    }
  },
  {
    id: 'aq-phon-coast-expedition',
    title: 'Phon Coast Expedition',
    description: 'Survey old imperial caches hidden beneath coral bridges.',
    durationMs: 18 * MINUTE_MS,
    maxAssignees: 4,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 8, totalVictories: 62 } },
    statRequirements: { atk: 46, mag: 34, res: 32 },
    rewards: {
      success: [{ type: 'gil', min: 330, max: 500 }, { type: 'shards', min: 34, max: 54 }],
      failure: [{ type: 'gil', min: 100, max: 160 }, { type: 'shards', min: 8, max: 13 }]
    }
  },
  {
    id: 'aq-archades-nightwatch',
    title: 'Archades Nightwatch',
    description: 'Patrol elevated avenues and repel phantom armor sorties.',
    durationMs: 22 * MINUTE_MS,
    maxAssignees: 4,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 9, totalVictories: 84 } },
    statRequirements: { atk: 56, def: 44, spd: 34 },
    rewards: {
      success: [{ type: 'gil', min: 450, max: 680 }, { type: 'shards', min: 44, max: 68 }],
      failure: [{ type: 'gil', min: 140, max: 214 }, { type: 'shards', min: 10, max: 16 }]
    }
  },
  {
    id: 'aq-ramuh-observatory',
    title: 'Ramuh Observatory Relay',
    description: 'Reignite storm pylons and deliver logstones to the scholars of old.',
    durationMs: 24 * MINUTE_MS,
    maxAssignees: 4,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 10, totalVictories: 105 } },
    statRequirements: { mag: 62, res: 49, spd: 35 },
    rewards: {
      success: [{ type: 'gil', min: 520, max: 760 }, { type: 'shards', min: 50, max: 76 }],
      failure: [{ type: 'gil', min: 160, max: 240 }, { type: 'shards', min: 12, max: 18 }]
    }
  },
  {
    id: 'aq-bahamut-wardline',
    title: 'Bahamut Wardline',
    description: 'Reinforce the skyward wardline sealing draconic echoes from the void.',
    durationMs: 30 * MINUTE_MS,
    maxAssignees: 5,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 11, totalVictories: 132 } },
    statRequirements: { atk: 74, mag: 68, res: 56 },
    rewards: {
      success: [{ type: 'gil', min: 720, max: 1040 }, { type: 'shards', min: 66, max: 98 }],
      failure: [{ type: 'gil', min: 210, max: 320 }, { type: 'shards', min: 14, max: 22 }]
    }
  },
  {
    id: 'aq-alexander-bulwark',
    title: 'Alexander Bulwark Repairs',
    description: 'Restore failing cathedral cannons guarding the inner crystal roads.',
    durationMs: 36 * MINUTE_MS,
    maxAssignees: 5,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 12, totalVictories: 165 } },
    statRequirements: { def: 82, mag: 72, res: 64 },
    rewards: {
      success: [{ type: 'gil', min: 880, max: 1240 }, { type: 'shards', min: 78, max: 114 }],
      failure: [{ type: 'gil', min: 250, max: 380 }, { type: 'shards', min: 18, max: 26 }]
    }
  },
  {
    id: 'aq-ultima-nexus-assault',
    title: 'Ultima Nexus Assault',
    description: 'Lead a veteran strike wing into the nexus and break the shadow core.',
    durationMs: 45 * MINUTE_MS,
    maxAssignees: 6,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 13, totalVictories: 210 } },
    statRequirements: { atk: 96, def: 78, mag: 86, res: 78, spd: 48 },
    rewards: {
      success: [{ type: 'gil', min: 1150, max: 1680 }, { type: 'shards', min: 96, max: 144 }],
      failure: [{ type: 'gil', min: 320, max: 500 }, { type: 'shards', min: 20, max: 30 }]
    }
  }
];

export const AIRSHIP_QUESTS_BY_ID = Object.fromEntries(AIRSHIP_QUESTS.map((quest) => [quest.id, quest]));

export const QUEST_UNLOCK_HOOKS = {
  hero_level: (state, params = {}) => state.hero.level >= (params.heroLevel ?? 1),
  hero_level_and_victories: (state, params = {}) => (
    state.hero.level >= (params.heroLevel ?? 1)
    && state.combat.totalVictories >= (params.totalVictories ?? 0)
  )
};
