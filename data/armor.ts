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
  {
    id: 'large-shield',
    name: 'Large Shield',
    defendDice: 2,
    goldCost: 300,
    restrictedClasses: ['Wizard'],
    description: 'Adds +2 defense dice. Cannot be used by Wizards or with two-handed weapons. (Expansion)',
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
    description: 'Adds +1 defense die. Interlocking metal rings. Cannot be used by Wizards.',
  },
  {
    id: 'plate-mail',
    name: 'Plate Mail',
    defendDice: 2,
    goldCost: 850,
    restrictedClasses: ['Wizard'],
    movementPenalty: true,
    description: 'Adds +2 defense dice, but movement is reduced to 1d6. Cannot be used by Wizards.',
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
  );
};
