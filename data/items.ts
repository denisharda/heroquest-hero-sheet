import { Item, ItemCategory } from '@/types';

// Base item definitions (quantity will be set when added to inventory)
interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  goldCost: number;
}

export const ITEM_DEFINITIONS: ItemDefinition[] = [
  // Potions
  {
    id: 'healing-potion',
    name: 'Healing Potion',
    category: 'potion',
    description: 'Restores up to 4 lost Body Points when consumed. Can save you from death if drunk at 0 BP.',
    goldCost: 100,
  },
  {
    id: 'heroic-brew',
    name: 'Heroic Brew',
    category: 'potion',
    description: 'Temporary stat boost.',
    goldCost: 150,
  },
  {
    id: 'potion-of-speed',
    name: 'Potion of Speed',
    category: 'potion',
    description: 'Extra movement for one turn.',
    goldCost: 100,
  },
  {
    id: 'potion-of-strength',
    name: 'Potion of Strength',
    category: 'potion',
    description: 'Extra attack dice for one combat.',
    goldCost: 150,
  },

  // Tools
  {
    id: 'toolkit',
    name: 'Toolkit',
    category: 'tool',
    description: 'Required to disarm traps (except Dwarf).',
    goldCost: 250,
  },

  // Artifacts (10 total - found during quests, not purchasable)
  {
    id: 'borins-armor',
    name: "Borin's Armor",
    category: 'artifact',
    description: 'Powerful dwarven armor.',
    goldCost: 0,
  },
  {
    id: 'elixir-of-life',
    name: 'Elixir of Life',
    category: 'artifact',
    description: 'Restores hero from death.',
    goldCost: 0,
  },
  {
    id: 'orcs-bane',
    name: "Orc's Bane",
    category: 'artifact',
    description: 'Bonus against Orcs.',
    goldCost: 0,
  },
  {
    id: 'ring-of-return',
    name: 'Ring of Return',
    category: 'artifact',
    description: 'Teleportation ability.',
    goldCost: 0,
  },
  {
    id: 'spell-ring',
    name: 'Spell Ring',
    category: 'artifact',
    description: 'Additional spell casting.',
    goldCost: 0,
  },
  {
    id: 'spirit-blade',
    name: 'Spirit Blade',
    category: 'artifact',
    description: 'Magical weapon (+4 Attack, diagonal attack).',
    goldCost: 0,
  },
  {
    id: 'talisman-of-lore',
    name: 'Talisman of Lore',
    category: 'artifact',
    description: 'Knowledge/wisdom bonus.',
    goldCost: 0,
  },
  {
    id: 'wand-of-magic',
    name: 'Wand of Magic',
    category: 'artifact',
    description: 'Magical attacks.',
    goldCost: 0,
  },
  {
    id: 'wizards-cloak',
    name: "Wizard's Cloak",
    category: 'artifact',
    description: 'Magical protection.',
    goldCost: 0,
  },
  {
    id: 'wizards-staff',
    name: "Wizard's Staff",
    category: 'artifact',
    description: 'Enhanced magical abilities.',
    goldCost: 0,
  },

  // Misc
  {
    id: 'gem',
    name: 'Gem',
    category: 'misc',
    description: 'Valuable gem (can be sold).',
    goldCost: 0,
  },
];

// Create an item instance for inventory
export const createItemInstance = (itemId: string, quantity: number = 1): Item | undefined => {
  const definition = ITEM_DEFINITIONS.find(i => i.id === itemId);
  if (!definition) return undefined;

  return {
    ...definition,
    quantity,
  };
};

export const getItemById = (id: string): ItemDefinition | undefined => {
  return ITEM_DEFINITIONS.find(i => i.id === id);
};

export const getItemsByCategory = (category: ItemCategory): ItemDefinition[] => {
  return ITEM_DEFINITIONS.filter(i => i.category === category);
};

// Only show purchasable items (not artifacts)
export const getPurchasableItems = (): ItemDefinition[] => {
  return ITEM_DEFINITIONS.filter(i => i.goldCost > 0);
};

export const ITEM_CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'potion', label: 'Potions' },
  { value: 'tool', label: 'Tools' },
  { value: 'artifact', label: 'Artifacts' },
  { value: 'misc', label: 'Miscellaneous' },
];
