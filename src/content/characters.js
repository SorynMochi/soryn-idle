export const STARTER_CHARACTER_ID = 'char_caelan';

export const CHARACTER_CONTENT = [
  {
    id: 'char_caelan',
    name: 'Cecil of Baron',
    tierId: 'common',
    baseStats: { hp: 122, mp: 42, atk: 17, def: 12, mag: 8, res: 10, spd: 11 },
    roles: ['vanguard'],
    passiveSpecialty: { id: 'stonewall', name: 'Darkblade Resolve', focus: 'guard' },
    equipmentHook: { profileId: 'sword_plate_accessory' }
  },
  {
    id: 'char_fiora',
    name: 'Rosa of Baron',
    tierId: 'common',
    baseStats: { hp: 94, mp: 58, atk: 11, def: 10, mag: 15, res: 12, spd: 14 },
    roles: ['support'],
    passiveSpecialty: { id: 'mending_hymn', name: 'White Prayer', focus: 'regen' },
    equipmentHook: { profileId: 'rod_cloth_accessory' }
  },
  {
    id: 'char_ren',
    name: 'Zidane of Lindblum',
    tierId: 'uncommon',
    baseStats: { hp: 110, mp: 45, atk: 18, def: 11, mag: 10, res: 9, spd: 15 },
    roles: ['striker'],
    passiveSpecialty: { id: 'chase_step', name: 'Bandit Sprint', focus: 'follow_up' },
    equipmentHook: { profileId: 'dagger_leather_accessory' }
  },
  {
    id: 'char_sylvie',
    name: 'Rydia of Mist',
    tierId: 'uncommon',
    baseStats: { hp: 99, mp: 74, atk: 10, def: 9, mag: 20, res: 13, spd: 12 },
    roles: ['mage'],
    passiveSpecialty: { id: 'aether_flow', name: 'Summoner Pulse', focus: 'mana_cycle' },
    equipmentHook: { profileId: 'staff_cloth_accessory' }
  },
  {
    id: 'char_darius',
    name: 'Auron of Spira',
    tierId: 'rare',
    baseStats: { hp: 148, mp: 48, atk: 24, def: 17, mag: 9, res: 11, spd: 10 },
    roles: ['vanguard'],
    passiveSpecialty: { id: 'lionheart_oath', name: 'Guardian Oath', focus: 'threat' },
    equipmentHook: { profileId: 'greatsword_plate_accessory' }
  },
  {
    id: 'char_lysette',
    name: 'Yuna of Besaid',
    tierId: 'rare',
    baseStats: { hp: 103, mp: 84, atk: 12, def: 10, mag: 24, res: 17, spd: 13 },
    roles: ['mage', 'support'],
    passiveSpecialty: { id: 'starlit_arc', name: 'Aeon Canticle', focus: 'burst_magic' },
    equipmentHook: { profileId: 'staff_silk_accessory' }
  },
  {
    id: 'char_garron',
    name: 'Basch of Dalmasca',
    tierId: 'epic',
    baseStats: { hp: 171, mp: 58, atk: 28, def: 18, mag: 13, res: 13, spd: 12 },
    roles: ['vanguard', 'striker'],
    passiveSpecialty: { id: 'war_cry', name: 'Captain\'s Roar', focus: 'party_attack_boost' },
    equipmentHook: { profileId: 'axe_plate_accessory' }
  },
  {
    id: 'char_sera',
    name: 'Lightning Farron',
    tierId: 'epic',
    baseStats: { hp: 119, mp: 94, atk: 15, def: 11, mag: 27, res: 19, spd: 17 },
    roles: ['mage', 'striker'],
    passiveSpecialty: { id: 'astral_veil', name: 'Paradigm Shift', focus: 'warding' },
    equipmentHook: { profileId: 'relic_all_accessory' }
  },
  {
    id: 'char_aurex',
    name: 'Terra Branford',
    tierId: 'legendary',
    baseStats: { hp: 166, mp: 112, atk: 24, def: 17, mag: 32, res: 22, spd: 18 },
    roles: ['vanguard', 'mage'],
    passiveSpecialty: { id: 'sunfall_edict', name: 'Esper Trance', focus: 'dual_mastery' },
    equipmentHook: { profileId: 'relic_all_accessory' }
  },
  {
    id: 'char_kain',
    name: 'Kain Highwind',
    tierId: 'common',
    baseStats: { hp: 128, mp: 32, atk: 19, def: 13, mag: 6, res: 8, spd: 12 },
    roles: ['striker'],
    passiveSpecialty: { id: 'chase_step', name: 'Dragoon Dive', focus: 'follow_up' },
    equipmentHook: { profileId: 'greatsword_plate_accessory' }
  },
  {
    id: 'char_rikku',
    name: 'Rikku of Al Bhed',
    tierId: 'common',
    baseStats: { hp: 97, mp: 46, atk: 13, def: 9, mag: 10, res: 10, spd: 16 },
    roles: ['support', 'striker'],
    passiveSpecialty: { id: 'aether_flow', name: 'Machina Knack', focus: 'mana_cycle' },
    equipmentHook: { profileId: 'dagger_leather_accessory' }
  },
  {
    id: 'char_vivi',
    name: 'Vivi Ornitier',
    tierId: 'common',
    baseStats: { hp: 88, mp: 68, atk: 9, def: 8, mag: 17, res: 12, spd: 12 },
    roles: ['mage'],
    passiveSpecialty: { id: 'starlit_arc', name: 'Black Waltz', focus: 'burst_magic' },
    equipmentHook: { profileId: 'rod_cloth_accessory' }
  },
  {
    id: 'char_fang',
    name: 'Oerba Yun Fang',
    tierId: 'uncommon',
    baseStats: { hp: 131, mp: 36, atk: 21, def: 14, mag: 8, res: 10, spd: 13 },
    roles: ['vanguard', 'striker'],
    passiveSpecialty: { id: 'war_cry', name: 'Lancer\'s Cry', focus: 'party_attack_boost' },
    equipmentHook: { profileId: 'axe_plate_accessory' }
  },
  {
    id: 'char_hope',
    name: 'Hope Estheim',
    tierId: 'uncommon',
    baseStats: { hp: 90, mp: 76, atk: 9, def: 9, mag: 21, res: 14, spd: 13 },
    roles: ['mage', 'support'],
    passiveSpecialty: { id: 'astral_veil', name: 'Boon of Eidolons', focus: 'warding' },
    equipmentHook: { profileId: 'rod_cloth_accessory' }
  },
  {
    id: 'char_tidus',
    name: 'Tidus of Zanarkand',
    tierId: 'uncommon',
    baseStats: { hp: 118, mp: 44, atk: 19, def: 12, mag: 9, res: 9, spd: 16 },
    roles: ['striker'],
    passiveSpecialty: { id: 'lionheart_oath', name: 'Blitz Tempo', focus: 'threat' },
    equipmentHook: { profileId: 'sword_plate_accessory' }
  },
  {
    id: 'char_balthier',
    name: 'Balthier Bunansa',
    tierId: 'rare',
    baseStats: { hp: 113, mp: 58, atk: 17, def: 11, mag: 14, res: 12, spd: 16 },
    roles: ['striker', 'support'],
    passiveSpecialty: { id: 'chase_step', name: 'Sky Pirate\'s Mark', focus: 'follow_up' },
    equipmentHook: { profileId: 'dagger_leather_accessory' }
  },
  {
    id: 'char_ashe',
    name: 'Ashe of Dalmasca',
    tierId: 'rare',
    baseStats: { hp: 108, mp: 82, atk: 13, def: 11, mag: 23, res: 16, spd: 14 },
    roles: ['mage', 'support'],
    passiveSpecialty: { id: 'aether_flow', name: 'Dynast\'s Focus', focus: 'mana_cycle' },
    equipmentHook: { profileId: 'staff_silk_accessory' }
  },
  {
    id: 'char_sabin',
    name: 'Sabin Rene Figaro',
    tierId: 'rare',
    baseStats: { hp: 152, mp: 34, atk: 25, def: 15, mag: 8, res: 10, spd: 13 },
    roles: ['vanguard', 'striker'],
    passiveSpecialty: { id: 'stonewall', name: 'Blitz Guard', focus: 'guard' },
    equipmentHook: { profileId: 'axe_plate_accessory' }
  },
  {
    id: 'char_rinoa',
    name: 'Rinoa Heartilly',
    tierId: 'epic',
    baseStats: { hp: 122, mp: 98, atk: 13, def: 12, mag: 29, res: 20, spd: 15 },
    roles: ['mage', 'support'],
    passiveSpecialty: { id: 'astral_veil', name: 'Angel Wing', focus: 'warding' },
    equipmentHook: { profileId: 'staff_silk_accessory' }
  },
  {
    id: 'char_noctis',
    name: 'Noctis Lucis Caelum',
    tierId: 'epic',
    baseStats: { hp: 160, mp: 72, atk: 27, def: 16, mag: 18, res: 14, spd: 17 },
    roles: ['vanguard', 'striker'],
    passiveSpecialty: { id: 'sunfall_edict', name: 'Armiger Shift', focus: 'dual_mastery' },
    equipmentHook: { profileId: 'relic_all_accessory' }
  },
  {
    id: 'char_celes',
    name: 'Celes Chere',
    tierId: 'epic',
    baseStats: { hp: 138, mp: 90, atk: 21, def: 15, mag: 25, res: 19, spd: 14 },
    roles: ['vanguard', 'mage'],
    passiveSpecialty: { id: 'starlit_arc', name: 'Runic Ward', focus: 'burst_magic' },
    equipmentHook: { profileId: 'sword_plate_accessory' }
  },
  {
    id: 'char_cloud',
    name: 'Cloud Strife',
    tierId: 'legendary',
    baseStats: { hp: 176, mp: 80, atk: 31, def: 19, mag: 19, res: 16, spd: 16 },
    roles: ['vanguard', 'striker'],
    passiveSpecialty: { id: 'lionheart_oath', name: 'Limit Resolve', focus: 'threat' },
    equipmentHook: { profileId: 'greatsword_plate_accessory' }
  },
  {
    id: 'char_squall',
    name: 'Squall Leonhart',
    tierId: 'legendary',
    baseStats: { hp: 169, mp: 76, atk: 30, def: 18, mag: 18, res: 16, spd: 17 },
    roles: ['vanguard', 'striker'],
    passiveSpecialty: { id: 'chase_step', name: 'Renzokuken', focus: 'follow_up' },
    equipmentHook: { profileId: 'relic_all_accessory' }
  },
  {
    id: 'char_yuna_legend',
    name: 'Yuna, Grand Summoner',
    tierId: 'legendary',
    baseStats: { hp: 150, mp: 128, atk: 16, def: 15, mag: 34, res: 26, spd: 18 },
    roles: ['mage', 'support'],
    passiveSpecialty: { id: 'sunfall_edict', name: 'Final Aeon Chorus', focus: 'dual_mastery' },
    equipmentHook: { profileId: 'staff_silk_accessory' }
  },
  {
    id: 'char_lightning_legend',
    name: 'Lightning, Savior',
    tierId: 'legendary',
    baseStats: { hp: 172, mp: 102, atk: 30, def: 19, mag: 30, res: 22, spd: 20 },
    roles: ['vanguard', 'mage', 'striker'],
    passiveSpecialty: { id: 'sunfall_edict', name: 'Gestalt Drive', focus: 'dual_mastery' },
    equipmentHook: { profileId: 'relic_all_accessory' }
  }
];

export const CHARACTERS_BY_ID = Object.fromEntries(CHARACTER_CONTENT.map((character) => [character.id, character]));
