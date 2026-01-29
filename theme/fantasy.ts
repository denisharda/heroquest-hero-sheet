import { Theme } from '@/types';

export const fantasyTheme: Theme = {
  name: 'fantasy',
  isDark: false,
  // No texture for light theme - using solid old paper color
  colors: {
    // Primary colors - warm medieval feel
    primary: '#8B4513',       // Saddle Brown
    secondary: '#DAA520',     // Goldenrod

    // Backgrounds - aged paper tones
    background: '#E8D9B5',    // Old paper / aged parchment
    surface: '#F5EDE0',       // Lighter aged paper
    surfaceVariant: '#DDD0B8', // Darker aged paper

    // Text
    text: '#2F1810',          // Dark brown
    textSecondary: '#6B4423', // Medium brown

    // Borders and accents
    border: '#C4A574',        // Tan border
    accent: '#B8860B',        // Dark Goldenrod
    accentSecondary: '#CD853F', // Peru

    // Health/Mind points
    health: '#C41E3A',        // Red
    healthEmpty: '#D9C5C5',   // Faded red/pink
    mind: '#4169E1',          // Royal Blue
    mindEmpty: '#C5CAD9',     // Faded blue

    // Utility colors
    gold: '#FFD700',          // Gold
    danger: '#8B0000',        // Dark Red
    success: '#228B22',       // Forest Green
  },
};
