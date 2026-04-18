import { Shield, Helmet, Armor, HeroClassName } from '@/types';

// Shields
export const SHIELDS: Shield[] = [
  {
    id: 'small-shield',
    name: 'Shield',
    defendDice: 1,
    goldCost: 150,
    restrictedClasses: ['Wizard'],
    description: 'Adds +1 defense die. Cannot be used by Wizards or with two-handed weapons.',
  },
];

export const NO_SHIELD: Shield = {
  id: 'none',
  name: 'None',
  defendDice: 0,
  goldCost: 0,
  description: 'No shield equipped.',
};

export const getShieldById = (id: string): Shield | undefined => {
  return SHIELDS.find(s => s.id === id);
};

export const getAvailableShields = (heroClass: HeroClassName): Shield[] => {
  return SHIELDS.filter(
    s => !s.restrictedClasses || !s.restrictedClasses.includes(heroClass)
  );
};

// Helmets
export const HELMETS: Helmet[] = [
  {
    id: 'helmet',
    name: 'Helmet',
    defendDice: 1,
    goldCost: 125,
    restrictedClasses: ['Wizard'],
    description: 'Adds +1 defense die. Cannot be used by Wizards.',
  },
];

export const NO_HELMET: Helmet = {
  id: 'none',
  name: 'None',
  defendDice: 0,
  goldCost: 0,
  description: 'No helmet equipped.',
};

export const getHelmetById = (id: string): Helmet | undefined => {
  return HELMETS.find(h => h.id === id);
};

export const getAvailableHelmets = (heroClass: HeroClassName): Helmet[] => {
  return HELMETS.filter(
    h => !h.restrictedClasses || !h.restrictedClasses.includes(heroClass)
  );
};

// Body Armor
export const ARMOR: Armor[] = [
  {
    id: 'chain-mail',
    name: 'Chain Mail',
    defendDice: 1,
    goldCost: 500,
    restrictedClasses: ['Wizard'],
    description: 'This light metal armor gives you 1 extra Defend die. May be combined with the helmet and/or shield. May not be worn by the wizard.',
  },
  {
    id: 'plate-mail',
    name: 'Plate Mail',
    defendDice: 2,
    goldCost: 850,
    restrictedClasses: ['Wizard'],
    movementPenalty: true,
    description: 'This heavy metal armor gives you 2 extra Defend dice. However, because it is so heavy, you may only roll 1 red die for movement while wearing it. May be combined with the helmet and/or shield. May not be worn by the wizard.',
  },
  {
    id: 'bracers',
    name: 'Bracers',
    defendDice: 1,
    goldCost: 550,
    description: 'These hardened leather bracers give you 1 extra Defend die. May be combined with the helmet and/or shield.',
  },

  // Artifact Armor
  {
    id: 'borins-armor',
    name: "Borin's Armor",
    defendDice: 2,
    goldCost: 0,
    isArtifact: true,
    restrictedClasses: ['Wizard'],
    description: 'This magical suit of plate mail gives you 2 extra Defend dice. Unlike normal plate mail, this mysterious, ultralight metal armor does not slow down its wearer. May be combined with the helmet and/or shield. May not be used by the wizard.',
  },
  {
    id: 'wizards-cloak',
    name: "Wizard's Cloak",
    defendDice: 1,
    goldCost: 0,
    isArtifact: true,
    restrictedClasses: ['Barbarian', 'Dwarf', 'Elf'],
    description: 'This magical cloak made of shimmery fabric is covered with mystical runes. It can be worn only by the wizard, giving them 1 extra Defend die.',
  },
];

export const NO_ARMOR: Armor = {
  id: 'none',
  name: 'None',
  defendDice: 0,
  goldCost: 0,
  description: 'No armor equipped.',
};

export const getArmorById = (id: string): Armor | undefined => {
  return ARMOR.find(a => a.id === id);
};

export const getAvailableArmor = (heroClass: HeroClassName): Armor[] => {
  return ARMOR.filter(
    a => !a.restrictedClasses || !a.restrictedClasses.includes(heroClass)
  ).filter(a => !a.isArtifact); // Don't show artifacts in normal selection
};
