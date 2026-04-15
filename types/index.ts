// Expansion Packs
export type QuestPack =
  | 'base'
  | 'kellars-keep'
  | 'return-of-the-witch-lord'
  | 'against-the-ogre-horde'
  | 'mage-of-the-mirror'
  | 'the-frozen-horror'
  | 'rise-of-the-dread-moon'
  | 'the-spirit-queens-torment'
  | 'first-light'
  | 'jungles-of-delthrak';

// Artifact Effects
export interface ArtifactEffect {
  bonusBodyPoints?: number;
  bonusMindPoints?: number;
  bonusDefendDice?: number;
  overrideArmorDefend?: number;
  negatesMovementPenalty?: boolean;
  allowedClasses?: HeroClassName[];
}

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
  pack?: QuestPack;
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
  pack?: QuestPack;
  description?: string;
  restrictedClasses?: HeroClassName[];
}

export interface Helmet {
  id: string;
  name: string;
  defendDice: number;
  goldCost: number;
  pack?: QuestPack;
  description?: string;
  restrictedClasses?: HeroClassName[];
}

export interface Armor {
  id: string;
  name: string;
  defendDice: number;
  goldCost: number;
  pack?: QuestPack;
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

export interface OwnedEquipment {
  weapons: Weapon[];
  shields: Shield[];
  helmets: Helmet[];
  armor: Armor[];
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
  ownedEquipment: OwnedEquipment;
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
  moveBreakdown?: string;
  bodyBreakdown?: string;
  mindBreakdown?: string;
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
  // Foundation
  primary: string;
  secondary: string;

  // Surfaces
  background: string;
  surface: string;
  surfaceVariant: string;

  // Text
  text: string;
  textSecondary: string;
  textOnAccent: string;

  // Borders
  border: string;

  // Accents
  accent: string;
  accentSecondary: string;

  // Health/Mind points
  health: string;
  healthEmpty: string;
  mind: string;
  mindEmpty: string;

  // Utility
  gold: string;
  danger: string;
  success: string;

  // Stat icons
  attack: string;
  defend: string;
  move: string;

  // Class portraits
  classBarbarian: string;
  classDwarf: string;
  classElf: string;
  classWizard: string;

  // Spell schools
  spellFire: string;
  spellWater: string;
  spellEarth: string;
  spellAir: string;

  // Item categories
  itemPotion: string;
  itemTool: string;
  itemArtifact: string;
  itemMisc: string;
}

export interface Theme {
  name: ThemeName;
  colors: ThemeColors;
  isDark: boolean;
  backgroundTexture?: any; // ImageSourcePropType
}

// Auth
export interface AuthUser {
  id: string;
  email: string | null;
  provider: 'email' | 'google' | 'apple';
}

// Sync
export interface HeroConflict {
  heroId: string;
  heroName: string;
  local: Hero | null; // null = hero was deleted locally
  remote: Hero;
}

export interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
  conflicts: HeroConflict[];
  pendingRestoreCount: number;
  autoShowRestores: boolean;
}
