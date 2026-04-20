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
    id: 'aq-slate-ridge-survey',
    title: 'Slate Ridge Survey',
    description: 'Map crystal winds around Slate Ridge before rival guilds arrive.',
    durationMs: 6 * MINUTE_MS,
    maxAssignees: 2,
    unlock: { id: 'hero_level', params: { heroLevel: 4 } },
    statRequirements: {
      atk: 24,
      spd: 20
    },
    rewards: {
      success: [
        { type: 'gil', min: 80, max: 130 },
        { type: 'shards', min: 12, max: 20 }
      ],
      failure: [{ type: 'gil', min: 24, max: 40 }]
    }
  },
  {
    id: 'aq-lucent-reef-supply-run',
    title: 'Lucent Reef Supply Run',
    description: 'Escort moonglass provisions through unstable currents.',
    durationMs: 12 * MINUTE_MS,
    maxAssignees: 3,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 5, totalVictories: 25 } },
    statRequirements: {
      def: 28,
      res: 24,
      spd: 22
    },
    rewards: {
      success: [
        { type: 'gil', min: 180, max: 280 },
        { type: 'shards', min: 18, max: 30 }
      ],
      failure: [
        { type: 'gil', min: 50, max: 90 },
        { type: 'shards', min: 3, max: 7 }
      ]
    }
  },
  {
    id: 'aq-ivory-ruin-expedition',
    title: 'Ivory Ruin Expedition',
    description: 'Recover auracite cores from sealed vaults under the ruin.',
    durationMs: 20 * MINUTE_MS,
    maxAssignees: 4,
    unlock: { id: 'hero_level_and_victories', params: { heroLevel: 7, totalVictories: 60 } },
    statRequirements: {
      atk: 44,
      mag: 36,
      res: 34
    },
    rewards: {
      success: [
        { type: 'gil', min: 340, max: 520 },
        { type: 'shards', min: 35, max: 58 }
      ],
      failure: [
        { type: 'gil', min: 100, max: 160 },
        { type: 'shards', min: 8, max: 14 }
      ]
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
