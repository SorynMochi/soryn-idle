export const STARTER_CHARACTER_ID = 'char_caelan';

export const CHARACTER_CONTENT = [
  {
    id: 'char_caelan',
    name: 'Caelan',
    tierId: 'common',
    baseStats: { hp: 120, mp: 40, atk: 16, def: 12, mag: 8, res: 10, spd: 11 },
    roles: ['vanguard'],
    passiveSpecialty: { id: 'stonewall', name: 'Stonewall', focus: 'guard' },
    equipmentHook: { profileId: 'sword_plate_accessory' }
  },
  {
    id: 'char_fiora',
    name: 'Fiora',
    tierId: 'common',
    baseStats: { hp: 95, mp: 55, atk: 12, def: 10, mag: 15, res: 11, spd: 14 },
    roles: ['support'],
    passiveSpecialty: { id: 'mending_hymn', name: 'Mending Hymn', focus: 'regen' },
    equipmentHook: { profileId: 'rod_cloth_accessory' }
  },
  {
    id: 'char_ren',
    name: 'Ren',
    tierId: 'uncommon',
    baseStats: { hp: 110, mp: 45, atk: 18, def: 11, mag: 10, res: 9, spd: 15 },
    roles: ['striker'],
    passiveSpecialty: { id: 'chase_step', name: 'Chase Step', focus: 'follow_up' },
    equipmentHook: { profileId: 'dagger_leather_accessory' }
  },
  {
    id: 'char_sylvie',
    name: 'Sylvie',
    tierId: 'uncommon',
    baseStats: { hp: 100, mp: 70, atk: 10, def: 9, mag: 19, res: 13, spd: 12 },
    roles: ['mage'],
    passiveSpecialty: { id: 'aether_flow', name: 'Aether Flow', focus: 'mana_cycle' },
    equipmentHook: { profileId: 'rod_cloth_accessory' }
  },
  {
    id: 'char_darius',
    name: 'Darius',
    tierId: 'rare',
    baseStats: { hp: 145, mp: 50, atk: 23, def: 16, mag: 10, res: 11, spd: 10 },
    roles: ['vanguard'],
    passiveSpecialty: { id: 'lionheart_oath', name: 'Lionheart Oath', focus: 'threat' },
    equipmentHook: { profileId: 'greatsword_plate_accessory' }
  },
  {
    id: 'char_lysette',
    name: 'Lysette',
    tierId: 'rare',
    baseStats: { hp: 102, mp: 82, atk: 12, def: 10, mag: 24, res: 16, spd: 13 },
    roles: ['mage', 'support'],
    passiveSpecialty: { id: 'starlit_arc', name: 'Starlit Arc', focus: 'burst_magic' },
    equipmentHook: { profileId: 'staff_cloth_accessory' }
  },
  {
    id: 'char_garron',
    name: 'Garron',
    tierId: 'epic',
    baseStats: { hp: 170, mp: 60, atk: 27, def: 18, mag: 14, res: 13, spd: 12 },
    roles: ['vanguard', 'striker'],
    passiveSpecialty: { id: 'war_cry', name: 'War Cry', focus: 'party_attack_boost' },
    equipmentHook: { profileId: 'axe_plate_accessory' }
  },
  {
    id: 'char_sera',
    name: 'Sera',
    tierId: 'epic',
    baseStats: { hp: 118, mp: 95, atk: 14, def: 11, mag: 28, res: 19, spd: 16 },
    roles: ['mage'],
    passiveSpecialty: { id: 'astral_veil', name: 'Astral Veil', focus: 'warding' },
    equipmentHook: { profileId: 'staff_silk_accessory' }
  },
  {
    id: 'char_aurex',
    name: 'Aurex',
    tierId: 'legendary',
    baseStats: { hp: 165, mp: 110, atk: 24, def: 17, mag: 31, res: 22, spd: 18 },
    roles: ['vanguard', 'mage'],
    passiveSpecialty: { id: 'sunfall_edict', name: 'Sunfall Edict', focus: 'dual_mastery' },
    equipmentHook: { profileId: 'relic_all_accessory' }
  }
];

export const CHARACTERS_BY_ID = Object.fromEntries(CHARACTER_CONTENT.map((character) => [character.id, character]));
