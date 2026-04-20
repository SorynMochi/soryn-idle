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
  {
    id: 'gear_ironblade',
    name: 'Ironblade',
    slot: 'weapon',
    category: 'sword',
    stats: { hp: 0, mp: 0, atk: 6, def: 0, mag: 0, res: 0, spd: 0 }
  },
  {
    id: 'gear_oakrod',
    name: 'Oak Rod',
    slot: 'weapon',
    category: 'rod',
    stats: { hp: 0, mp: 8, atk: 0, def: 0, mag: 7, res: 0, spd: 0 }
  },
  {
    id: 'gear_moon_dagger',
    name: 'Moon Dagger',
    slot: 'weapon',
    category: 'dagger',
    stats: { hp: 0, mp: 0, atk: 4, def: 0, mag: 0, res: 0, spd: 4 }
  },
  {
    id: 'gear_warded_staff',
    name: 'Warded Staff',
    slot: 'weapon',
    category: 'staff',
    stats: { hp: 0, mp: 10, atk: 0, def: 0, mag: 8, res: 2, spd: 0 }
  },
  {
    id: 'gear_vanguard_mail',
    name: 'Vanguard Mail',
    slot: 'armor',
    category: 'plate',
    stats: { hp: 20, mp: 0, atk: 0, def: 7, mag: 0, res: 2, spd: -1 }
  },
  {
    id: 'gear_wayfarer_vest',
    name: 'Wayfarer Vest',
    slot: 'armor',
    category: 'leather',
    stats: { hp: 10, mp: 0, atk: 2, def: 4, mag: 0, res: 1, spd: 1 }
  },
  {
    id: 'gear_seer_robe',
    name: 'Seer Robe',
    slot: 'armor',
    category: 'cloth',
    stats: { hp: 8, mp: 12, atk: 0, def: 3, mag: 5, res: 3, spd: 0 }
  },
  {
    id: 'gear_starwoven_silk',
    name: 'Starwoven Silk',
    slot: 'armor',
    category: 'silk',
    stats: { hp: 6, mp: 15, atk: 0, def: 2, mag: 6, res: 4, spd: 1 }
  },
  {
    id: 'gear_luck_charm',
    name: 'Lucky Charm',
    slot: 'accessory',
    category: 'accessory',
    stats: { hp: 5, mp: 5, atk: 1, def: 1, mag: 1, res: 1, spd: 1 }
  },
  {
    id: 'gear_guardian_ring',
    name: 'Guardian Ring',
    slot: 'accessory',
    category: 'accessory',
    stats: { hp: 12, mp: 0, atk: 0, def: 3, mag: 0, res: 3, spd: 0 }
  }
];

export const EQUIPMENT_BY_ID = Object.fromEntries(EQUIPMENT_ITEMS.map((item) => [item.id, item]));

export const STARTING_EQUIPMENT_INVENTORY = {
  gear_ironblade: 1,
  gear_oakrod: 2,
  gear_moon_dagger: 1,
  gear_warded_staff: 1,
  gear_vanguard_mail: 2,
  gear_wayfarer_vest: 1,
  gear_seer_robe: 2,
  gear_starwoven_silk: 1,
  gear_luck_charm: 3,
  gear_guardian_ring: 1
};
