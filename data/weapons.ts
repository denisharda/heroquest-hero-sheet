import { Weapon, HeroClassName } from '@/types';

export const WEAPONS: Weapon[] = [
  // One-Handed Weapons
  {
    id: 'dagger',
    name: 'Dagger',
    attackDice: 1,
    diagonalAttack: false,
    twoHanded: false,
    throwable: true,
    goldCost: 25,
    description: 'Throwable (lost when used).',
  },
  {
    id: 'hatchet',
    name: 'Hatchet',
    attackDice: 1,
    diagonalAttack: false,
    twoHanded: false,
    throwable: true,
    goldCost: 50,
    restrictedClasses: ['Wizard'],
    description: 'Throwable. Cannot be used by Wizards.',
  },
  {
    id: 'whip',
    name: 'Whip',
    attackDice: 1,
    diagonalAttack: false,
    twoHanded: false,
    goldCost: 125,
    restrictedClasses: ['Wizard'],
    description: 'A flexible weapon. Cannot be used by Wizards.',
  },
  {
    id: 'shortsword',
    name: 'Shortsword',
    attackDice: 2,
    diagonalAttack: false,
    twoHanded: false,
    goldCost: 150,
    restrictedClasses: ['Wizard'],
    description: 'A reliable blade. Cannot be used by Wizards.',
  },
  {
    id: 'axe',
    name: 'Axe',
    attackDice: 2,
    diagonalAttack: false,
    twoHanded: false,
    throwable: true,
    goldCost: 200,
    restrictedClasses: ['Wizard'],
    description: 'Throwable. Cannot be used by Wizards.',
  },
  {
    id: 'hammer',
    name: 'Hammer',
    attackDice: 2,
    diagonalAttack: false,
    twoHanded: false,
    throwable: true,
    goldCost: 200,
    restrictedClasses: ['Wizard'],
    description: 'Throwable. Cannot be used by Wizards.',
  },
  {
    id: 'flail',
    name: 'Flail',
    attackDice: 2,
    diagonalAttack: false,
    twoHanded: false,
    goldCost: 250,
    restrictedClasses: ['Wizard'],
    description: 'A spiked ball on a chain. Cannot be used by Wizards.',
  },
  {
    id: 'broadsword',
    name: 'Broadsword',
    attackDice: 3,
    diagonalAttack: false,
    twoHanded: false,
    goldCost: 250,
    restrictedClasses: ['Wizard'],
    description: 'A powerful blade. Cannot be used by Wizards.',
  },
  {
    id: 'longsword',
    name: 'Longsword',
    attackDice: 3,
    diagonalAttack: true,
    twoHanded: false,
    goldCost: 350,
    restrictedClasses: ['Wizard'],
    description: 'A finely crafted long blade. Allows diagonal attack. Cannot be used by Wizards.',
  },

  // Two-Handed Weapons
  {
    id: 'staff',
    name: 'Staff',
    attackDice: 1,
    diagonalAttack: true,
    twoHanded: true,
    goldCost: 100,
    description: 'A wooden staff. Allows diagonal attack. Two-handed, no shield allowed.',
  },
  {
    id: 'shortbow',
    name: 'Short Bow',
    attackDice: 1,
    diagonalAttack: true,
    twoHanded: true,
    ranged: true,
    goldCost: 100,
    restrictedClasses: ['Wizard'],
    description: 'Ranged. Two-handed, 1 turn to switch weapons. Cannot be used by Wizards.',
  },
  {
    id: 'longbow',
    name: 'Long Bow',
    attackDice: 2,
    diagonalAttack: true,
    twoHanded: true,
    ranged: true,
    goldCost: 200,
    restrictedClasses: ['Wizard'],
    description: 'Ranged. Two-handed, 1 turn to switch weapons. Cannot be used by Wizards.',
  },
  {
    id: 'crossbow',
    name: 'Crossbow',
    attackDice: 3,
    diagonalAttack: true,
    twoHanded: true,
    ranged: true,
    goldCost: 350,
    restrictedClasses: ['Wizard'],
    description: 'Ranged. Two-handed, 1 turn reload. Cannot be used by Wizards.',
  },
  {
    id: 'spear',
    name: 'Spear',
    attackDice: 2,
    diagonalAttack: false,
    twoHanded: true,
    goldCost: 400,
    restrictedClasses: ['Wizard'],
    description: '2-square range. Two-handed, no shield. Cannot be used by Wizards.',
  },
  {
    id: 'battle-axe',
    name: 'Battle Axe',
    attackDice: 4,
    diagonalAttack: false,
    twoHanded: true,
    goldCost: 450,
    restrictedClasses: ['Wizard'],
    description: 'Devastating power. Two-handed, no shield. Cannot be used by Wizards.',
  },
  {
    id: 'halberd',
    name: 'Halberd',
    attackDice: 3,
    diagonalAttack: false,
    twoHanded: true,
    goldCost: 500,
    restrictedClasses: ['Wizard'],
    description: '2-square range. Two-handed, no shield. Cannot be used by Wizards.',
  },
  {
    id: 'two-handed-sword',
    name: 'Two-Handed Sword',
    attackDice: 4,
    diagonalAttack: false,
    twoHanded: true,
    goldCost: 600,
    restrictedClasses: ['Wizard'],
    description: 'Maximum melee power. Two-handed, no shield. Cannot be used by Wizards.',
  },

  // Artifact Weapon
  {
    id: 'spirit-blade',
    name: 'Spirit Blade',
    attackDice: 4,
    diagonalAttack: true,
    twoHanded: false,
    goldCost: 0,
    isArtifact: true,
    description: 'A magical blade. Artifact - cannot be purchased.',
  },
];

// Starting weapons by class
export const STARTING_WEAPONS: Record<HeroClassName, string> = {
  Barbarian: 'broadsword',
  Dwarf: 'shortsword',
  Elf: 'shortsword',
  Wizard: 'dagger',
};

export const getWeaponById = (id: string): Weapon | undefined => {
  return WEAPONS.find(w => w.id === id);
};

export const getAvailableWeapons = (heroClass: HeroClassName): Weapon[] => {
  return WEAPONS.filter(
    w => !w.restrictedClasses || !w.restrictedClasses.includes(heroClass)
  ).filter(w => !w.isArtifact); // Don't show artifacts in normal selection
};

export const getStartingWeapon = (heroClass: HeroClassName): Weapon | null => {
  const weaponId = STARTING_WEAPONS[heroClass];
  return getWeaponById(weaponId) || null;
};

export const NO_WEAPON: Weapon = {
  id: 'none',
  name: 'None (Unarmed)',
  attackDice: 0,
  diagonalAttack: false,
  twoHanded: false,
  goldCost: 0,
  description: 'Fighting without a weapon.',
};
