import { Item, ItemCategory, ArtifactEffect, QuestPack } from '@/types';

// Base item definitions (quantity will be set when added to inventory)
interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  goldCost: number;
  pack?: QuestPack;
  shortEffect?: string;
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
    description: 'This tool kit gives you a 50 percent chance to disarm any searched-for-and-found (but unsprung) trap.',
    goldCost: 250,
  },

  // Artifacts (10 total - found during quests, not purchasable)
  {
    id: 'talisman-of-lore',
    name: 'Talisman of Lore',
    category: 'artifact',
    description: 'This magical medallion increases your Mind Points by 1 for as long as it is worn.',
    goldCost: 0,
    shortEffect: '+1 Mind Point',
  },
  {
    id: 'wizards-cloak',
    name: "Wizard's Cloak",
    category: 'artifact',
    description: 'This magical cloak made of shimmery fabric is covered with mystical runes. It can be worn only by the wizard, giving them 1 extra Defend die.',
    goldCost: 0,
  },
  {
    id: 'borins-armor',
    name: "Borin's Armor",
    category: 'artifact',
    description: 'This magical suit of plate mail gives you 2 extra Defend dice. Unlike normal plate mail, this mysterious, ultralight metal armor does not slow down its wearer. May be combined with the helmet and/or shield. May not be used by the wizard.',
    goldCost: 0,
  },
  {
    id: 'wand-of-magic',
    name: 'Wand of Magic',
    category: 'artifact',
    description: 'This magical wand allows a hero to cast two separate and different spells on their turn instead of one single spell.',
    goldCost: 0,
    shortEffect: 'Cast 2 different spells per turn',
  },
  {
    id: 'elixir-of-life',
    name: 'Elixir of Life',
    category: 'artifact',
    description: 'This small bottle of pearly liquid brings a dead hero back to life, restoring all of their Body and Mind Points. This potion can only be used once.',
    goldCost: 0,
  },
  {
    id: 'ring-of-return',
    name: 'Ring of Return',
    category: 'artifact',
    description: 'When invoked, this magical ring returns all heroes that the ring wearer can see to the starting point of the quest. It can only be used once.',
    goldCost: 0,
    shortEffect: 'Return all visible heroes to quest start (one use)',
  },
  {
    id: 'orcs-bane',
    name: "Orc's Bane",
    category: 'artifact',
    description: 'When using this magical shortsword, you roll 2 Attack dice. You may attack twice if attacking an orc. May not be used by the wizard.',
    goldCost: 0,
  },
  {
    id: 'spirit-blade',
    name: 'Spirit Blade',
    category: 'artifact',
    description: 'This magical broadsword has an eerie handle of carved bone. When using it, roll 3 Attack dice, or roll 4 if attacking an undead monster (skeleton, zombie, or mummy). May not be used by the wizard.',
    goldCost: 0,
  },
  {
    id: 'wizards-staff',
    name: "Wizard's Staff",
    category: 'artifact',
    description: 'This long ancient staff glows with a soft blue light. It can be used only by the wizard, giving them 2 Attack dice and the ability to strike diagonally.',
    goldCost: 0,
  },
  {
    id: 'spell-ring',
    name: 'Spell Ring',
    category: 'artifact',
    description: 'This ring enables a hero to cast one spell two times (not simultaneously). At the beginning of a quest, the wearer of this ring must declare which of their spells is stored in the ring.',
    goldCost: 0,
    shortEffect: 'Cast one spell twice per quest',
  },
  {
    id: 'rod-of-telekinesis',
    name: 'Rod of Telekinesis',
    category: 'artifact',
    description: 'Once per quest, you may use this rod to trap a monster within magical force. A trapped monster misses its next turn. The spell can be resisted immediately by the monster rolling 1 red die for each of their Mind Points. If a 6 is rolled, it resists the spell.',
    goldCost: 0,
  },
  {
    id: 'ring-of-fortitude',
    name: 'Ring of Fortitude',
    category: 'artifact',
    description: 'This magical ring raises a hero\'s Body Points by 1.',
    goldCost: 0,
    shortEffect: '+1 Body Point',
  },
  {
    id: 'fortunes-longsword',
    name: "Fortune's Longsword",
    category: 'artifact',
    description: "This long blade enables you to attack diagonally and gives you 3 Attack dice. Once per quest, the hero may use its power to reroll 1 Attack die. May not be used by the wizard.",
    goldCost: 0,
  },
  {
    id: 'phantom-blade',
    name: 'Phantom Blade',
    category: 'artifact',
    description: 'This ornate dagger gives you 1 Attack die. Once per quest, when you attack with the dagger your target may not defend themself as the weapon passes through their armor.',
    goldCost: 0,
  },

  // Consumables
  {
    id: 'potion-of-speed',
    name: 'Potion of Speed',
    category: 'potion',
    description: 'You may drink the potion at any time. It allows you to roll twice as many dice as usual the next time you move. The card is then discarded.',
    goldCost: 200,
  },
  {
    id: 'holy-water',
    name: 'Holy Water',
    category: 'misc',
    description: 'You may use the holy water instead of attacking. It kills any undead creature (skeleton, zombie, or mummy). Discarded after use.',
    goldCost: 400,
  },

  // Misc
  {
    id: 'gem',
    name: 'Gem',
    category: 'misc',
    description: 'Tucked into the toe of an old boot you find a small gem worth 35 gold coins.',
    goldCost: 0,
  },
  {
    id: 'jewels',
    name: 'Jewels',
    category: 'misc',
    description: 'A small wooden box lined with velvet containing very small jewels worth 50 gold coins.',
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

// Artifact passive stat effects (looked up at computation time).
// borins-armor and wizards-cloak are intentionally omitted — they are equippable
// via data/armor.ts (isArtifact: true) and their bonuses apply only when equipped.
export const ARTIFACT_EFFECTS: Record<string, ArtifactEffect> = {
  'talisman-of-lore': { bonusMindPoints: 1 },
  'ring-of-fortitude': { bonusBodyPoints: 1 },
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
