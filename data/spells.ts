import { Spell, SpellSchool } from '@/types';

// Base spell definitions (without the 'used' state)
interface SpellDefinition {
  id: string;
  name: string;
  school: SpellSchool;
  description: string;
}

export const SPELL_DEFINITIONS: SpellDefinition[] = [
  // Air Spells
  {
    id: 'genie',
    name: 'Genie',
    school: 'Air',
    description: 'Summons a powerful Genie to assist the party. The Genie acts as an additional hero with its own movement and combat abilities. It can attack monsters and defend other heroes. The Genie remains until the end of the quest or until destroyed.',
  },
  {
    id: 'swift-wind',
    name: 'Swift Wind',
    school: 'Air',
    description: 'Cast on any hero (including yourself). The target may immediately move up to 6 additional squares. This movement ignores the normal movement roll and can be used to escape dangerous situations or reach distant objectives quickly.',
  },
  {
    id: 'tempest',
    name: 'Tempest',
    school: 'Air',
    description: 'Unleashes a powerful wind attack that affects all monsters in a straight line from the caster. Roll 3 combat dice for each monster hit. Each skull rolled deals 1 Body Point of damage. Monsters cannot defend against this attack.',
  },

  // Earth Spells
  {
    id: 'heal-body',
    name: 'Heal Body',
    school: 'Earth',
    description: 'Cast on any hero (including yourself). Restores up to 4 lost Body Points to the target. The hero cannot exceed their maximum Body Points. One of the most valuable spells for keeping the party alive during difficult quests.',
  },
  {
    id: 'pass-through-rock',
    name: 'Pass Through Rock',
    school: 'Earth',
    description: 'Cast on any hero (including yourself). For the duration of this turn, the target may move through walls and blocked squares as if they were open. The hero must end their movement on a valid, unoccupied square.',
  },
  {
    id: 'rock-skin',
    name: 'Rock Skin',
    school: 'Earth',
    description: 'Cast on any hero (including yourself). The target gains +2 additional Defend dice until the end of the quest. This bonus stacks with armor and shields. An excellent defensive spell for protecting vulnerable party members.',
  },

  // Fire Spells
  {
    id: 'ball-of-flame',
    name: 'Ball of Flame',
    school: 'Fire',
    description: 'Hurls a ball of magical fire at any visible monster. Roll 2 combat dice. Each skull rolled deals 1 Body Point of damage. The target monster cannot defend against this magical attack. Requires line of sight to the target.',
  },
  {
    id: 'courage',
    name: 'Courage',
    school: 'Fire',
    description: 'Cast on any hero (including yourself). Removes all fear effects and prevents the target from being affected by fear for the rest of the quest. Also grants +1 Attack die until the end of the quest. Can counter certain Dread spells.',
  },
  {
    id: 'fire-of-wrath',
    name: 'Fire of Wrath',
    school: 'Fire',
    description: 'The most powerful offensive spell. Cast on any visible monster. Roll 4 combat dice. Each skull rolled deals 1 Body Point of damage. The target cannot defend. This spell can destroy most monsters in a single casting.',
  },

  // Water Spells
  {
    id: 'sleep',
    name: 'Sleep',
    school: 'Water',
    description: 'Cast on any visible monster. The target falls into a deep magical sleep and cannot move, attack, or defend until it is attacked or the quest ends. Sleeping monsters are automatically hit (no attack roll needed) and cannot defend.',
  },
  {
    id: 'veil-of-mist',
    name: 'Veil of Mist',
    school: 'Water',
    description: 'Cast on any hero (including yourself). Creates a protective veil of magical mist around the target. Until the end of the quest, monsters must roll 1 fewer Attack die when attacking this hero (minimum 1 die).',
  },
  {
    id: 'water-of-healing',
    name: 'Water of Healing',
    school: 'Water',
    description: 'Cast on any hero (including yourself). Summons magical healing waters that restore up to 2 lost Body Points to the target. The hero cannot exceed their maximum Body Points. A weaker but still useful healing spell.',
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
