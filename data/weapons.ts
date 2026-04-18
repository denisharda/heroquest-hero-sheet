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
    description: 'Throwable for ranged attack (lost when thrown). The only weapon Wizards can purchase.',
  },
  {
    id: 'shortsword',
    name: 'Shortsword',
    attackDice: 2,
    diagonalAttack: false,
    twoHanded: false,
    goldCost: 150,
    restrictedClasses: ['Wizard'],
    description: 'This short sword gives you the attack strength of 2 combat dice. May not be used by the wizard.',
  },
  {
    id: 'handaxe',
    name: 'Handaxe',
    attackDice: 2,
    diagonalAttack: false,
    twoHanded: false,
    throwable: true,
    goldCost: 200,
    restrictedClasses: ['Wizard'],
    description: 'This handaxe allows you to roll 2 Attack dice. It can also be thrown at any monster in your line of sight but is lost once it is thrown.',
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
    id: 'crossbow',
    name: 'Crossbow',
    attackDice: 3,
    diagonalAttack: true,
    twoHanded: false,
    ranged: true,
    goldCost: 350,
    restrictedClasses: ['Wizard'],
    description: 'This long-range weapon gives you the attack strength of 3 combat dice. You may fire at any monster that you can see. However, you cannot fire at a monster that is adjacent to you. You have an unlimited supply of arrows. May not be used by the wizard.',
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
  // Artifact Weapons
  {
    id: 'orcs-bane',
    name: "Orc's Bane",
    attackDice: 2,
    diagonalAttack: false,
    twoHanded: false,
    goldCost: 0,
    isArtifact: true,
    restrictedClasses: ['Wizard'],
    description: "Roll 2 combat dice to attack. You may attack twice if attacking an Orc. Artifact from Quest 11.",
  },
  {
    id: 'wizards-staff',
    name: "Wizard's Staff",
    attackDice: 2,
    diagonalAttack: true,
    twoHanded: true,
    goldCost: 0,
    isArtifact: true,
    restrictedClasses: ['Barbarian', 'Dwarf', 'Elf'],
    description: "This ancient staff glows with a soft blue light. Roll 2 combat dice to attack, with diagonal strike. Wizard only. Artifact from Quest 12.",
  },
  {
    id: 'spirit-blade',
    name: 'Spirit Blade',
    attackDice: 3,
    diagonalAttack: false,
    twoHanded: false,
    goldCost: 0,
    isArtifact: true,
    restrictedClasses: ['Wizard'],
    description: 'This magical broadsword has an eerie handle of carved bone. When using it, roll 3 Attack dice, or roll 4 if attacking an undead monster (skeleton, zombie, or mummy). May not be used by the wizard.',
  },
  {
    id: 'fortunes-longsword',
    name: "Fortune's Longsword",
    attackDice: 3,
    diagonalAttack: true,
    twoHanded: false,
    goldCost: 0,
    isArtifact: true,
    restrictedClasses: ['Wizard'],
    description: "This long blade enables you to attack diagonally and gives you 3 Attack dice. Once per quest, the hero may use its power to reroll 1 Attack die. May not be used by the wizard.",
  },
  {
    id: 'phantom-blade',
    name: 'Phantom Blade',
    attackDice: 1,
    diagonalAttack: false,
    twoHanded: false,
    goldCost: 0,
    isArtifact: true,
    description: 'This ornate dagger gives you 1 Attack die. Once per quest, when you attack with the dagger your target may not defend themself as the weapon passes through their armor.',
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
  name: 'Base weapon',
  attackDice: 0,
  diagonalAttack: false,
  twoHanded: false,
  goldCost: 0,
  description: 'Using your starting equipment.',
};
