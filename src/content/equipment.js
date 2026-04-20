export const EQUIPMENT_SLOT_ORDER = ['weapon', 'armor', 'accessory'];

export const EQUIPMENT_PROFILES = {
  sword_plate_accessory: {
    id: 'sword_plate_accessory',
    slotRules: {
      weapon: ['sword'],
      armor: ['plate'],
      accessory: ['accessory']
    }
  },
  rod_cloth_accessory: {
    id: 'rod_cloth_accessory',
    slotRules: {
      weapon: ['rod'],
      armor: ['cloth'],
      accessory: ['accessory']
    }
  },
  dagger_leather_accessory: {
    id: 'dagger_leather_accessory',
    slotRules: {
      weapon: ['dagger'],
      armor: ['leather'],
      accessory: ['accessory']
    }
  },
  greatsword_plate_accessory: {
    id: 'greatsword_plate_accessory',
    slotRules: {
      weapon: ['greatsword'],
      armor: ['plate'],
      accessory: ['accessory']
    }
  },
  staff_cloth_accessory: {
    id: 'staff_cloth_accessory',
    slotRules: {
      weapon: ['staff'],
      armor: ['cloth'],
      accessory: ['accessory']
    }
  },
  axe_plate_accessory: {
    id: 'axe_plate_accessory',
    slotRules: {
      weapon: ['axe'],
      armor: ['plate'],
      accessory: ['accessory']
    }
  },
  staff_silk_accessory: {
    id: 'staff_silk_accessory',
    slotRules: {
      weapon: ['staff'],
      armor: ['silk'],
      accessory: ['accessory']
    }
  },
  relic_all_accessory: {
    id: 'relic_all_accessory',
    slotRules: {
      weapon: ['sword', 'rod', 'dagger', 'greatsword', 'staff', 'axe'],
      armor: ['plate', 'cloth', 'leather', 'silk'],
      accessory: ['accessory']
    }
  }
};

export const EQUIPMENT_ITEMS = [
  { id: 'gear_ironblade', name: 'Ironblade', slot: 'weapon', category: 'sword', stats: { hp: 0, mp: 0, atk: 6, def: 0, mag: 0, res: 0, spd: 0 } },
  { id: 'gear_mythril_saber', name: 'Mythril Saber', slot: 'weapon', category: 'sword', stats: { hp: 0, mp: 4, atk: 10, def: 0, mag: 1, res: 0, spd: 0 } },
  { id: 'gear_rune_blade', name: 'Rune Blade', slot: 'weapon', category: 'sword', stats: { hp: 0, mp: 8, atk: 12, def: 0, mag: 2, res: 1, spd: 0 } },
  { id: 'gear_save_the_queen', name: 'Save the Queen', slot: 'weapon', category: 'sword', stats: { hp: 0, mp: 10, atk: 15, def: 0, mag: 3, res: 2, spd: 1 } },

  { id: 'gear_oakrod', name: 'Oak Rod', slot: 'weapon', category: 'rod', stats: { hp: 0, mp: 8, atk: 0, def: 0, mag: 7, res: 0, spd: 0 } },
  { id: 'gear_ice_rod', name: 'Ice Rod', slot: 'weapon', category: 'rod', stats: { hp: 0, mp: 10, atk: 1, def: 0, mag: 9, res: 1, spd: 0 } },
  { id: 'gear_thunder_rod', name: 'Thunder Rod', slot: 'weapon', category: 'rod', stats: { hp: 0, mp: 12, atk: 1, def: 0, mag: 11, res: 1, spd: 0 } },
  { id: 'gear_stardust_rod', name: 'Stardust Rod', slot: 'weapon', category: 'rod', stats: { hp: 0, mp: 16, atk: 2, def: 0, mag: 13, res: 2, spd: 0 } },

  { id: 'gear_moon_dagger', name: 'Moon Dagger', slot: 'weapon', category: 'dagger', stats: { hp: 0, mp: 0, atk: 4, def: 0, mag: 0, res: 0, spd: 4 } },
  { id: 'gear_mage_masher', name: 'Mage Masher', slot: 'weapon', category: 'dagger', stats: { hp: 0, mp: 2, atk: 7, def: 0, mag: 1, res: 0, spd: 5 } },
  { id: 'gear_orichalcum', name: 'Orichalcum', slot: 'weapon', category: 'dagger', stats: { hp: 0, mp: 4, atk: 10, def: 0, mag: 2, res: 1, spd: 6 } },
  { id: 'gear_zwill_crossblade', name: 'Zwill Crossblade', slot: 'weapon', category: 'dagger', stats: { hp: 0, mp: 6, atk: 12, def: 0, mag: 3, res: 1, spd: 7 } },

  { id: 'gear_warded_staff', name: 'Warded Staff', slot: 'weapon', category: 'staff', stats: { hp: 0, mp: 10, atk: 0, def: 0, mag: 8, res: 2, spd: 0 } },
  { id: 'gear_healer_staff', name: 'Healer Staff', slot: 'weapon', category: 'staff', stats: { hp: 4, mp: 14, atk: 0, def: 0, mag: 10, res: 4, spd: 0 } },
  { id: 'gear_nirvana_branch', name: 'Nirvana Branch', slot: 'weapon', category: 'staff', stats: { hp: 8, mp: 18, atk: 0, def: 0, mag: 13, res: 5, spd: 1 } },
  { id: 'gear_astral_cane', name: 'Astral Cane', slot: 'weapon', category: 'staff', stats: { hp: 10, mp: 22, atk: 0, def: 1, mag: 16, res: 6, spd: 1 } },

  { id: 'gear_bastard_sword', name: 'Bastard Sword', slot: 'weapon', category: 'greatsword', stats: { hp: 0, mp: 0, atk: 11, def: 0, mag: 0, res: 0, spd: -1 } },
  { id: 'gear_defender', name: 'Defender', slot: 'weapon', category: 'greatsword', stats: { hp: 8, mp: 0, atk: 14, def: 2, mag: 0, res: 1, spd: -1 } },
  { id: 'gear_ragnarok', name: 'Ragnarok', slot: 'weapon', category: 'greatsword', stats: { hp: 12, mp: 4, atk: 18, def: 2, mag: 1, res: 2, spd: 0 } },

  { id: 'gear_battle_axe', name: 'Battle Axe', slot: 'weapon', category: 'axe', stats: { hp: 6, mp: 0, atk: 10, def: 1, mag: 0, res: 0, spd: -1 } },
  { id: 'gear_golden_axe', name: 'Golden Axe', slot: 'weapon', category: 'axe', stats: { hp: 10, mp: 0, atk: 13, def: 2, mag: 0, res: 1, spd: -1 } },
  { id: 'gear_titan_axe', name: 'Titan Axe', slot: 'weapon', category: 'axe', stats: { hp: 14, mp: 0, atk: 17, def: 3, mag: 0, res: 2, spd: -2 } },

  { id: 'gear_vanguard_mail', name: 'Vanguard Mail', slot: 'armor', category: 'plate', stats: { hp: 20, mp: 0, atk: 0, def: 7, mag: 0, res: 2, spd: -1 } },
  { id: 'gear_crystal_mail', name: 'Crystal Mail', slot: 'armor', category: 'plate', stats: { hp: 30, mp: 0, atk: 1, def: 10, mag: 0, res: 3, spd: -1 } },
  { id: 'gear_genji_armor', name: 'Genji Armor', slot: 'armor', category: 'plate', stats: { hp: 40, mp: 0, atk: 1, def: 13, mag: 0, res: 4, spd: -2 } },

  { id: 'gear_wayfarer_vest', name: 'Wayfarer Vest', slot: 'armor', category: 'leather', stats: { hp: 10, mp: 0, atk: 2, def: 4, mag: 0, res: 1, spd: 1 } },
  { id: 'gear_thief_vest', name: 'Thief Vest', slot: 'armor', category: 'leather', stats: { hp: 14, mp: 0, atk: 3, def: 6, mag: 0, res: 2, spd: 2 } },
  { id: 'gear_adamant_vest', name: 'Adamant Vest', slot: 'armor', category: 'leather', stats: { hp: 20, mp: 0, atk: 4, def: 8, mag: 0, res: 3, spd: 2 } },

  { id: 'gear_seer_robe', name: 'Seer Robe', slot: 'armor', category: 'cloth', stats: { hp: 8, mp: 12, atk: 0, def: 3, mag: 5, res: 3, spd: 0 } },
  { id: 'gear_wizard_robe', name: 'Wizard Robe', slot: 'armor', category: 'cloth', stats: { hp: 10, mp: 18, atk: 0, def: 4, mag: 7, res: 4, spd: 0 } },
  { id: 'gear_magi_robe', name: 'Magi Robe', slot: 'armor', category: 'cloth', stats: { hp: 12, mp: 24, atk: 0, def: 5, mag: 9, res: 6, spd: 0 } },

  { id: 'gear_starwoven_silk', name: 'Starwoven Silk', slot: 'armor', category: 'silk', stats: { hp: 6, mp: 15, atk: 0, def: 2, mag: 6, res: 4, spd: 1 } },
  { id: 'gear_seraph_silk', name: 'Seraph Silk', slot: 'armor', category: 'silk', stats: { hp: 8, mp: 22, atk: 0, def: 3, mag: 8, res: 6, spd: 2 } },
  { id: 'gear_aegis_silk', name: 'Aegis Silk', slot: 'armor', category: 'silk', stats: { hp: 10, mp: 28, atk: 0, def: 4, mag: 10, res: 8, spd: 2 } },

  { id: 'gear_luck_charm', name: 'Lucky Charm', slot: 'accessory', category: 'accessory', stats: { hp: 5, mp: 5, atk: 1, def: 1, mag: 1, res: 1, spd: 1 } },
  { id: 'gear_guardian_ring', name: 'Guardian Ring', slot: 'accessory', category: 'accessory', stats: { hp: 12, mp: 0, atk: 0, def: 3, mag: 0, res: 3, spd: 0 } },
  { id: 'gear_hero_bangle', name: 'Hero Bangle', slot: 'accessory', category: 'accessory', stats: { hp: 16, mp: 4, atk: 3, def: 2, mag: 1, res: 2, spd: 1 } },
  { id: 'gear_magi_ring', name: 'Magi Ring', slot: 'accessory', category: 'accessory', stats: { hp: 8, mp: 14, atk: 0, def: 1, mag: 4, res: 3, spd: 1 } },
  { id: 'gear_ribbon', name: 'Ribbon', slot: 'accessory', category: 'accessory', stats: { hp: 14, mp: 10, atk: 1, def: 3, mag: 2, res: 5, spd: 2 } }
];

export const EQUIPMENT_BY_ID = Object.fromEntries(EQUIPMENT_ITEMS.map((item) => [item.id, item]));

export const STARTING_EQUIPMENT_INVENTORY = {
  gear_ironblade: 1,
  gear_mythril_saber: 1,
  gear_oakrod: 2,
  gear_ice_rod: 1,
  gear_moon_dagger: 1,
  gear_mage_masher: 1,
  gear_warded_staff: 1,
  gear_bastard_sword: 1,
  gear_battle_axe: 1,
  gear_vanguard_mail: 2,
  gear_wayfarer_vest: 2,
  gear_seer_robe: 2,
  gear_starwoven_silk: 2,
  gear_luck_charm: 3,
  gear_guardian_ring: 2,
  gear_hero_bangle: 1,
  gear_magi_ring: 1
};
