import { Spell, SpellSchool, QuestPack } from '@/types';

// Base spell definitions (without the 'used' state)
interface SpellDefinition {
  id: string;
  name: string;
  school: SpellSchool;
  description: string;
  pack?: QuestPack;
}

export const SPELL_DEFINITIONS: SpellDefinition[] = [
  // Air Spells
  {
    id: 'genie',
    name: 'Genie',
    school: 'Air',
    description: 'This spell conjures up a genie who does one of the following: opens any door on the board (revealing what lies beyond) or uses 5 combat dice to attack any monster within your line of sight.',
  },
  {
    id: 'swift-wind',
    name: 'Swift Wind',
    school: 'Air',
    description: 'This spell may be cast on any one hero, including yourself. Its powerful burst of energy enables that hero to roll twice as many red dice as normal the next time they move.',
  },
  {
    id: 'tempest',
    name: 'Tempest',
    school: 'Air',
    description: 'This spell creates a small whirlwind that envelops one monster of your choice. That monster then misses its next turn.',
  },

  // Earth Spells
  {
    id: 'heal-body',
    name: 'Heal Body',
    school: 'Earth',
    description: 'This spell may be cast on any one hero, including yourself. Its magical power immediately restores up to 4 lost Body Points, but does not give a hero more than their starting number.',
  },
  {
    id: 'pass-through-rock',
    name: 'Pass Through Rock',
    school: 'Earth',
    description: 'This spell may be cast on any one hero, including yourself. That hero may then move through walls on their next move. They may move through as many walls as their dice roll allows. Caution! There are shaded areas on each quest map that indicate solid rock. If a hero ends their move in one of these areas, they are trapped forever!',
  },
  {
    id: 'rock-skin',
    name: 'Rock Skin',
    school: 'Earth',
    description: 'This spell may be cast on any one hero, including yourself. That hero may throw 1 extra combat die when defending. The spell is broken when the hero suffers 1 Body Point of damage.',
  },

  // Fire Spells
  {
    id: 'ball-of-flame',
    name: 'Ball of Flame',
    school: 'Fire',
    description: 'This spell may be cast on any one monster, enveloping it in a ball of fire. It inflicts 2 Body Points of damage. The monster then rolls 2 red dice. For each 5 or 6 rolled, the damage is reduced by 1 point.',
  },
  {
    id: 'courage',
    name: 'Courage',
    school: 'Fire',
    description: 'This spell may be cast on any one hero, including yourself. The next time that hero attacks, they may roll 2 extra combat dice. The spell is broken the moment a monster is no longer in the hero\'s line of sight.',
  },
  {
    id: 'fire-of-wrath',
    name: 'Fire of Wrath',
    school: 'Fire',
    description: 'This spell may be cast on any one monster, blasting it with flames. It inflicts 1 Body Point of damage, unless the monster can immediately roll a 5 or 6 using 1 red die.',
  },

  // Water Spells
  {
    id: 'sleep',
    name: 'Sleep',
    school: 'Water',
    description: 'This spell puts a monster into a deep sleep so it cannot move, attack, or defend itself. The spell can be broken at once or on a future turn by a monster rolling 1 red die for each of its Mind Points. If a 6 is rolled, the spell is broken. May not be used against mummies, zombies, or skeletons.',
  },
  {
    id: 'veil-of-mist',
    name: 'Veil of Mist',
    school: 'Water',
    description: 'This spell may be cast on any one hero, including yourself. On the hero\'s next move, they may move unseen through spaces that are occupied by monsters.',
  },
  {
    id: 'water-of-healing',
    name: 'Water of Healing',
    school: 'Water',
    description: 'This spell may be cast on any one hero, including yourself. Contact with this revitalizing water restores up to 4 lost Body Points but does not give a hero more than their starting number.',
  },
];

// Spell Distribution Rules (from official rulebook):
// 1. Wizard picks ONE school first
// 2. Elf picks ONE school from the remaining three
// 3. Wizard gets the remaining TWO schools
// Result: Wizard = 3 schools (9 spells), Elf = 1 school (3 spells)
// IMPORTANT: Elf and Wizard CANNOT share the same school!

// Elf chooses ONE school (3 spells)
// Default: Earth (healing focused) - as suggested in rulebook for first quest
export const ELF_STARTING_SPELLS: string[] = [
  'heal-body',
  'pass-through-rock',
  'rock-skin',
];

// Wizard chooses THREE schools (9 spells)
// Default: Fire (picked first) + Air + Water (remaining after Elf takes Earth)
// This follows the rulebook suggestion for first quest
export const WIZARD_STARTING_SPELLS: string[] = [
  // Fire (Wizard's first pick - as suggested in rulebook)
  'ball-of-flame',
  'courage',
  'fire-of-wrath',
  // Air (remaining school)
  'genie',
  'swift-wind',
  'tempest',
  // Water (remaining school)
  'sleep',
  'veil-of-mist',
  'water-of-healing',
];

// Create spell instances with 'used' state
export const createSpellInstance = (spellId: string): Spell | undefined => {
  const definition = SPELL_DEFINITIONS.find(s => s.id === spellId);
  if (!definition) return undefined;

  return {
    ...definition,
    used: false,
  };
};

export const createStartingSpells = (heroClass: 'Elf' | 'Wizard'): Spell[] => {
  const spellIds = heroClass === 'Elf' ? ELF_STARTING_SPELLS : WIZARD_STARTING_SPELLS;
  return spellIds
    .map(id => createSpellInstance(id))
    .filter((spell): spell is Spell => spell !== undefined);
};

export const getSpellsBySchool = (spells: Spell[], school: SpellSchool): Spell[] => {
  return spells.filter(s => s.school === school);
};

export const SPELL_SCHOOLS: SpellSchool[] = ['Air', 'Earth', 'Fire', 'Water'];

// Get all spells for a specific school
export const getSpellsForSchool = (school: SpellSchool): Spell[] => {
  return SPELL_DEFINITIONS
    .filter(s => s.school === school)
    .map(s => ({ ...s, used: false }));
};

// Create spells from selected schools (for hero creation)
export const createSpellsFromSchools = (schools: SpellSchool[]): Spell[] => {
  return schools.flatMap(school => getSpellsForSchool(school));
};
