import { HeroClassStats, HeroClassName } from '@/types';
import { lightPalette } from '@/theme/palette';

export const HERO_CLASSES: Record<HeroClassName, HeroClassStats> = {
  Barbarian: {
    name: 'Barbarian',
    baseAttack: 3,
    baseDefend: 2,
    baseMove: 2, // 2d6 for movement (red dice)
    bodyPoints: 8,
    mindPoints: 2,
    canCastSpells: false,
    portraitColor: lightPalette.red,
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
    portraitColor: lightPalette.brown,
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
    portraitColor: lightPalette.green,
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
    portraitColor: lightPalette.blue,
    portraitInitial: 'W',
  },
};

export const getHeroClassStats = (className: HeroClassName): HeroClassStats => {
  return HERO_CLASSES[className];
};

export const HERO_CLASS_NAMES: HeroClassName[] = ['Barbarian', 'Dwarf', 'Elf', 'Wizard'];
