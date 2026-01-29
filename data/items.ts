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
    name: 'Potion of Healing',
    category: 'potion',
    description: 'You can drink this healing potion at any time, restoring the number of Body Points equal to a roll of one die. You cannot exceed your starting number of Body Points.',
    goldCost: 100,
  },
  {
    id: 'heroic-brew',
    name: 'Heroic Brew',
    category: 'potion',
    description: 'If you drink its contents before you attack, you can make two attacks instead of one.',
    goldCost: 0,
  },
  {
    id: 'potion-of-strength',
    name: 'Potion of Strength',
    category: 'potion',
    description: 'You can drink this strange smelling liquid at any time, enabling you to roll two extra combat dice the next time you attack.',
    goldCost: 0,
  },
  {
    id: 'potion-of-defense',
    name: 'Potion of Defense',
    category: 'potion',
    description: 'You can drink this potion at any time, giving you two extra combat dice next time you defend.',
    goldCost: 0,
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
    description: 'This magical medallion increases your Mind Points by 1 for as long as it is worn. Found in Quest 5.',
    goldCost: 0,
  },
  {
    id: 'wizards-cloak',
    name: "Wizard's Cloak",
    category: 'artifact',
    description: 'This magical cloak made of shimmery fabric is covered with mystical runes. It can be worn only by the Wizard, giving him one extra combat die in defense. Found in Quest 6.',
    goldCost: 0,
  },
  {
    id: 'borins-armor',
    name: "Borin's Armor",
    category: 'artifact',
    description: 'This magical suit of plate mail allows the wearer to roll four combat dice in defense. Unlike normal plate mail, this mysterious, ultralight metal armor does not slow down its wearer. May not be used by Wizard. Found in Quest 7.',
    goldCost: 0,
  },
  {
    id: 'wand-of-magic',
    name: 'Wand of Magic',
    category: 'artifact',
    description: 'This magical wand allows the Elf or Wizard to cast two separate and different spells on his turn instead of one single spell. Found in Quest 8.',
    goldCost: 0,
  },
  {
    id: 'elixir-of-life',
    name: 'Elixir of Life',
    category: 'artifact',
    description: 'This small bottle of pearly liquid will bring a dead Hero back to life, restoring all of his Body and Mind Points. This potion can only be used once. Found in Quest 9.',
    goldCost: 0,
  },
  {
    id: 'ring-of-return',
    name: 'Ring of Return',
    category: 'artifact',
    description: "When invoked, this magical ring will return all Heroes that the ring wearer can 'see' to the starting point of the Quest. It can only be used once. Found in Quest 10.",
    goldCost: 0,
  },
  {
    id: 'orcs-bane',
    name: "Orc's Bane",
    category: 'artifact',
    description: "When using this magical shortsword, you roll two combat dice to attack. You may attack twice if attacking an Orc. May not be used by Wizard. Found in Quest 11.",
    goldCost: 0,
  },
  {
    id: 'spirit-blade',
    name: 'Spirit Blade',
    category: 'artifact',
    description: 'This magical broadsword has an eerie handle of carved bone. When using it, roll three combat dice to attack, or roll four combat dice if attacking an undead monster (Skeleton, Zombie, or Mummy). May not be used by Wizard. The only weapon that can harm the Witch Lord. Found in Quest 13.',
    goldCost: 0,
  },
  {
    id: 'wizards-staff',
    name: "Wizard's Staff",
    category: 'artifact',
    description: 'This long ancient staff glows with a soft blue light. It can be used only by the Wizard, giving him the attack strength of two combat dice and the ability to strike diagonally. Found in Quest 12.',
    goldCost: 0,
  },
  {
    id: 'spell-ring',
    name: 'Spell Ring',
    category: 'artifact',
    description: 'This ring enables the Wizard or Elf to cast one spell two times (not simultaneously). At the beginning of a quest, the wearer must declare which spell is stored in the ring. Found in Quest 14.',
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
