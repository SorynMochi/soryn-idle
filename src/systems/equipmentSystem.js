import { CHARACTERS_BY_ID } from '../content/characters.js';
import { EQUIPMENT_BY_ID, EQUIPMENT_ITEMS, EQUIPMENT_PROFILES, EQUIPMENT_SLOT_ORDER } from '../content/equipment.js';

const STAT_KEYS = ['hp', 'mp', 'atk', 'def', 'mag', 'res', 'spd'];

export const equipmentSystem = {
  getStatKeys() {
    return STAT_KEYS;
  },
  getSlotOrder() {
    return EQUIPMENT_SLOT_ORDER;
  },
  getInventoryCount(state, itemId) {
    return Math.max(0, Math.floor(state.inventory?.equipment?.[itemId] ?? 0));
  },
  getItemById(itemId) {
    return EQUIPMENT_BY_ID[itemId] ?? null;
  },
  getEquippedItem(state, instanceId, slotId) {
    const itemId = state.roster.byInstanceId?.[instanceId]?.equipmentSlots?.[slotId];
    return itemId ? EQUIPMENT_BY_ID[itemId] ?? null : null;
  },
  canEquip(state, instanceId, itemId, slotId = null) {
    const instance = state.roster.byInstanceId?.[instanceId];
    const item = EQUIPMENT_BY_ID[itemId];
    if (!instance || !item) {
      return false;
    }

    const resolvedSlotId = slotId ?? item.slot;
    if (item.slot !== resolvedSlotId) {
      return false;
    }

    const character = CHARACTERS_BY_ID[instance.characterId];
    const profileId = character?.equipmentHook?.profileId;
    const profile = profileId ? EQUIPMENT_PROFILES[profileId] : null;
    if (!profile) {
      return false;
    }

    const allowedCategories = profile.slotRules[resolvedSlotId] ?? [];
    if (!allowedCategories.includes(item.category)) {
      return false;
    }

    return this.getInventoryCount(state, itemId) > 0;
  },
  equip(state, instanceId, itemId, slotId = null) {
    const item = EQUIPMENT_BY_ID[itemId];
    const resolvedSlotId = slotId ?? item?.slot;
    if (!item || !resolvedSlotId || !this.canEquip(state, instanceId, itemId, resolvedSlotId)) {
      return { ok: false, reason: 'Gear cannot be equipped by this character.' };
    }

    const instance = state.roster.byInstanceId[instanceId];
    const currentId = instance.equipmentSlots[resolvedSlotId];
    if (currentId === itemId) {
      return { ok: true };
    }

    if (currentId) {
      this.unequip(state, instanceId, resolvedSlotId);
    }

    state.inventory.equipment[itemId] = this.getInventoryCount(state, itemId) - 1;
    instance.equipmentSlots[resolvedSlotId] = itemId;
    return { ok: true };
  },
  unequip(state, instanceId, slotId) {
    const instance = state.roster.byInstanceId?.[instanceId];
    if (!instance) {
      return { ok: false, reason: 'Unknown character instance.' };
    }

    const currentId = instance.equipmentSlots?.[slotId];
    if (!currentId) {
      return { ok: true };
    }

    state.inventory.equipment[currentId] = this.getInventoryCount(state, currentId) + 1;
    instance.equipmentSlots[slotId] = null;
    return { ok: true };
  },
  getEquipmentBonus(state, instanceId) {
    const totals = zeroStats();
    const slots = state.roster.byInstanceId?.[instanceId]?.equipmentSlots ?? {};
    for (const slotId of EQUIPMENT_SLOT_ORDER) {
      const itemId = slots[slotId];
      const item = itemId ? EQUIPMENT_BY_ID[itemId] : null;
      if (!item) continue;

      for (const stat of STAT_KEYS) {
        totals[stat] += item.stats?.[stat] ?? 0;
      }
    }

    return totals;
  },
  getFinalStats(baseStats, bonusStats) {
    const finalStats = {};
    for (const stat of STAT_KEYS) {
      finalStats[stat] = (baseStats?.[stat] ?? 0) + (bonusStats?.[stat] ?? 0);
    }
    return finalStats;
  },
  getEquipOptions(state, instanceId, slotId) {
    return EQUIPMENT_ITEMS.filter((item) => {
      if (item.slot !== slotId) {
        return false;
      }

      return this.canEquip(state, instanceId, item.id, slotId);
    });
  }
};

function zeroStats() {
  return { hp: 0, mp: 0, atk: 0, def: 0, mag: 0, res: 0, spd: 0 };
}
