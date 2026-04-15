import { Theme } from '@/types';
import { darkPalette as p } from './palette';

export const darkFantasyTheme: Theme = {
  name: 'darkFantasy',
  isDark: true,
  colors: {
    // Foundation
    primary: p.red,
    secondary: p.purple,

    // Surfaces
    background: p.stoneDark,
    surface: p.stone,
    surfaceVariant: p.stoneLight,

    // Text
    text: p.parchmentLight,
    textSecondary: p.parchmentFaded,
    textOnAccent: p.white,

    // Borders
    border: p.stoneBorder,

    // Accents
    accent: p.gold,
    accentSecondary: p.brown,

    // Health/Mind
    health: p.red,
    healthEmpty: p.healthEmpty,
    mind: p.purple,
    mindEmpty: p.mindEmpty,

    // Utility
    gold: p.gold,
    danger: p.red,
    success: p.green,

    // Stat icons
    attack: p.red,
    defend: p.blue,
    move: p.green,

    // Class portraits
    classBarbarian: p.red,
    classDwarf: p.brown,
    classElf: p.green,
    classWizard: p.blue,

    // Spell schools
    spellFire: p.red,
    spellWater: p.blue,
    spellEarth: p.brown,
    spellAir: p.blue,

    // Item categories
    itemPotion: p.purple,
    itemTool: p.gold,
    itemArtifact: p.purple,
    itemMisc: p.gray,
  },
};
