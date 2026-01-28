import { HeroClassStats, HeroClassName } from '@/types';

export const HERO_CLASSES: Record<HeroClassName, HeroClassStats> = {
  Barbarian: {
    name: 'Barbarian',
    baseAttack: 3,
    baseDefend: 2,
    baseMove: 2, // 2d6 for movement (red dice)
    bodyPoints: 8,
    mindPoints: 2,
    canCastSpells: false,
    portraitColor: '#C41E3A', // Red
    portraitInitial: 'B',
  },
  Dwarf: {
    name: 'Dwarf',
    baseAttack: 2,
    baseDefend: 2,
    baseMove: 2, // 2d6 for movement (red dice)
    bodyPoints: 7,
    mindPoints: 3,
    canCastSpells: false,
    portraitColor: '#8B4513', // Brown
    portraitInitial: 'D',
  },
  Elf: {
    name: 'Elf',
    baseAttack: 2,
    baseDefend: 2,
    baseMove: 2, // 2d6 for movement (red dice)
    bodyPoints: 6,
    mindPoints: 4,
    canCastSpells: true,
    portraitColor: '#228B22', // Green
    portraitInitial: 'E',
  },
  Wizard: {
    name: 'Wizard',
    baseAttack: 1,
    baseDefend: 2,
    baseMove: 2, // 2d6 for movement (red dice)
    bodyPoints: 4,
    mindPoints: 6,
    canCastSpells: true,
    portraitColor: '#4169E1', // Blue
    portraitInitial: 'W',
  },
};

export const getHeroClassStats = (className: HeroClassName): HeroClassStats => {
  return HERO_CLASSES[className];
};

export const HERO_CLASS_NAMES: HeroClassName[] = ['Barbarian', 'Dwarf', 'Elf', 'Wizard'];
