import { Theme } from '@/types';

export const darkFantasyTheme: Theme = {
  name: 'darkFantasy',
  isDark: true,
  // No texture - using solid dark fantasy color
  colors: {
    // Primary colors - gothic dungeon feel
    primary: '#8B0000',       // Dark blood red
    secondary: '#4A0E4E',     // Deep purple

    // Backgrounds - stone dungeon colors
    background: '#1C1C1C',    // Charcoal black
    surface: '#2D2D2D',       // Dark stone gray
    surfaceVariant: '#3D3D3D', // Lighter stone gray

    // Text - parchment tones
    text: '#E8DCC4',          // Aged parchment
    textSecondary: '#9A8C7B', // Faded parchment

    // Borders and accents - aged gold/bronze
    border: '#4A4A4A',        // Stone border
    accent: '#C9A227',        // Antique gold
    accentSecondary: '#8B6914', // Dark bronze

    // Health/Mind points
    health: '#B22222',        // Firebrick red (blood)
    healthEmpty: '#3D2020',   // Dried blood
    mind: '#6B3FA0',          // Mystical purple
    mindEmpty: '#2D1F3D',     // Dark purple shadow

    // Utility colors
    gold: '#DAA520',          // Goldenrod (treasure)
    danger: '#8B0000',        // Dark red
    success: '#2E5D3A',       // Forest green
  },
};
