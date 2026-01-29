// Hero Classes
export type HeroClassName = 'Barbarian' | 'Dwarf' | 'Elf' | 'Wizard';

export interface HeroClassStats {
  name: HeroClassName;
  baseAttack: number;
  baseDefend: number;
  baseMove: number;
  bodyPoints: number;
  mindPoints: number;
  canCastSpells: boolean;
  portraitColor: string;
  portraitInitial: string;
}

// Equipment Types
export type EquipmentSlot = 'weapon' | 'shield' | 'helmet' | 'armor';

export interface Weapon {
  id: string;
  name: string;
  attackDice: number;
  diagonalAttack: boolean;
  twoHanded: boolean;
  goldCost: number;
  restrictedClasses?: HeroClassName[];
  description?: string;
  throwable?: boolean;
  ranged?: boolean;
  isArtifact?: boolean;
}

export interface Shield {
  id: string;
  name: string;
  defendDice: number;
  goldCost: number;
  description?: string;
  restrictedClasses?: HeroClassName[];
}

export interface Helmet {
  id: string;
  name: string;
  defendDice: number;
  goldCost: number;
  description?: string;
  restrictedClasses?: HeroClassName[];
}

export interface Armor {
  id: string;
  name: string;
  defendDice: number;
  goldCost: number;
  description?: string;
  restrictedClasses?: HeroClassName[];
  movementPenalty?: boolean; // Reduces movement to 1d6
}

export interface Equipment {
  weapon: Weapon | null;
  shield: Shield | null;
  helmet: Helmet | null;
  armor: Armor | null;
}

// Spells
export type SpellSchool = 'Fire' | 'Water' | 'Earth' | 'Air';

export interface Spell {
  id: string;
  name: string;
  school: SpellSchool;
  description: string;
  used: boolean;
}

// Items
export type ItemCategory = 'potion' | 'tool' | 'artifact' | 'misc';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  goldCost: number;
  quantity: number;
}

// Hero State
export interface Hero {
  id: string;
  name: string;
  heroClass: HeroClassName;
  currentBodyPoints: number;
  currentMindPoints: number;
  equipment: Equipment;
  spells: Spell[];
  gold: number;
  inventory: Item[];
  questsCompleted: number[];
  createdAt: number;
  updatedAt: number;
}

// Computed Stats (derived from hero + equipment)
export interface ComputedStats {
  totalAttack: number;
  totalDefend: number;
  moveDice: number; // 1 or 2 (affected by Plate Mail)
  maxBodyPoints: number;
  maxMindPoints: number;
  attackBreakdown: string;
  defendBreakdown: string;
}

// Undo/Redo
export interface HistoryEntry {
  hero: Hero;
  timestamp: number;
  action: string;
}

// Theme
export type ThemeName = 'fantasy' | 'darkFantasy';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentSecondary: string;
  health: string;
  healthEmpty: string;
  mind: string;
  mindEmpty: string;
  gold: string;
  danger: string;
  success: string;
}

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
  isDark: boolean;
  backgroundTexture?: any; // ImageSourcePropType
}
