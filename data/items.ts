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
    description: 'Restores up to 4 lost Body Points. Can be drunk at any time (not an action). Can save you from death if drunk immediately at 0 BP.',
    goldCost: 100,
  },
  {
    id: 'heroic-brew',
    name: 'Heroic Brew',
    category: 'potion',
    description: 'Grants a temporary bonus to combat dice for one turn. Found in treasure.',
    goldCost: 150,
  },
  {
    id: 'potion-of-speed',
    name: 'Potion of Speed',
    category: 'potion',
    description: 'Doubles your movement for one turn. Can be drunk at any time (not an action). Found in treasure.',
    goldCost: 100,
  },
  {
    id: 'potion-of-strength',
    name: 'Potion of Strength',
    category: 'potion',
    description: 'Adds extra attack dice for your next combat. Can be drunk at any time (not an action). Found in treasure.',
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
    id: 'talisman-of-lore',
    name: 'Talisman of Lore',
    category: 'artifact',
    description: 'Enhances understanding of magic. Grants bonus Mind Points. Found in Quest 5: Melar\'s Maze.',
    goldCost: 0,
  },
  {
    id: 'wizards-cloak',
    name: "Wizard's Cloak",
    category: 'artifact',
    description: 'Provides magical protection, adding defense dice. Found in Quest 6: Legacy of the Orc Warlord.',
    goldCost: 0,
  },
  {
    id: 'borins-armor',
    name: "Borin's Armor",
    category: 'artifact',
    description: 'Legendary dwarven armor that provides exceptional defense. Found in Quest 7: The Lost Wizard.',
    goldCost: 0,
  },
  {
    id: 'wand-of-magic',
    name: 'Wand of Magic',
    category: 'artifact',
    description: 'Enables magical ranged attacks for non-spellcasters. Found in Quest 8: The Fire Mage.',
    goldCost: 0,
  },
  {
    id: 'elixir-of-life',
    name: 'Elixir of Life',
    category: 'artifact',
    description: 'Can restore a dead hero back to life with full Body Points. Single use. Found in Quest 9: Race Against Time.',
    goldCost: 0,
  },
  {
    id: 'ring-of-return',
    name: 'Ring of Return',
    category: 'artifact',
    description: 'Allows instant teleportation back to the stairway. Found in Quest 10: Castle of Mystery.',
    goldCost: 0,
  },
  {
    id: 'orcs-bane',
    name: "Orc's Bane",
    category: 'artifact',
    description: 'A magic sword that deals extra damage against Orcs and Goblins. Found in Quest 11: Bastion of Dread.',
    goldCost: 0,
  },
  {
    id: 'spirit-blade',
    name: 'Spirit Blade',
    category: 'artifact',
    description: '4 Attack dice with diagonal attack. The ONLY weapon that can harm the Witch Lord. Found in Quest 12/13.',
    goldCost: 0,
  },
  {
    id: 'wizards-staff',
    name: "Wizard's Staff",
    category: 'artifact',
    description: 'Enhances magical abilities, allowing spells to be cast with greater power. Found in Quest 12: Barrow of the Witch Lord.',
    goldCost: 0,
  },
  {
    id: 'spell-ring',
    name: 'Spell Ring',
    category: 'artifact',
    description: 'Allows the wearer to cast one additional spell per quest. Found in Quest 14: Return to Barak Tor.',
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
