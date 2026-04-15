import { Theme } from '@/types';
import { lightPalette as p } from './palette';

export const fantasyTheme: Theme = {
  name: 'fantasy',
  isDark: false,
  colors: {
    // Foundation
    primary: p.brown,
    secondary: p.gold,

    // Surfaces
    background: p.parchment,
    surface: p.parchmentLight,
    surfaceVariant: p.parchmentDark,

    // Text
    text: p.inkDark,
    textSecondary: p.inkLight,
    textOnAccent: p.white,

    // Borders
    border: p.tan,

    // Accents
    accent: p.gold,
    accentSecondary: p.brown,

    // Health/Mind
    health: p.red,
    healthEmpty: '#D9C5C5',
    mind: p.purple,
    mindEmpty: '#D5C5D9',

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
