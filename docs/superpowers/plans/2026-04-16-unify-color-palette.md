# Unify Color Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the app's color palette so each semantic color role (red, green, blue, gold, purple, gray) uses exactly one canonical value per theme, eliminating the ~80 distinct color values scattered across theme files, constants, and inline styles.

**Architecture:** Define a single "palette" object per theme that maps canonical color names to hex values, then build all semantic tokens (health, danger, attack, fire, barbarian, etc.) by referencing those palette entries. Move all non-theme constants (spell school, item category, stat icons, class portraits) into the theme system so they adapt to dark mode. Replace hardcoded `#FFFFFF` with a new `textOnAccent` theme token, and replace hex-suffix opacity hacks (`+ '30'`) with a helper function.

**Tech Stack:** React Native, Expo, TypeScript, Zustand (theme persistence)

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `types/index.ts` | Modify | Expand `ThemeColors` interface with new tokens |
| `theme/palette.ts` | Create | Canonical palette: one red, one green, one blue, one gold, one purple, one gray per theme |
| `theme/fantasy.ts` | Modify | Rebuild light theme from palette |
| `theme/darkFantasy.ts` | Modify | Rebuild dark theme from palette |
| `theme/colorUtils.ts` | Create | `withOpacity(hex, alpha)` helper to replace `+ '30'` hacks |
| `constants/colors.ts` | Modify | Reduce to overlays + pure colors only; remove all hue constants |
| `data/heroes.ts` | Modify | Replace hardcoded `portraitColor` with lookup from theme or constants |
| `components/StatBlock.tsx` | Modify | Use theme tokens instead of `SHARED_COLORS` |
| `components/SpellTracker.tsx` | Modify | Use theme tokens instead of `SPELL_SCHOOL_COLORS` |
| `components/HeroSwitcher.tsx` | Modify | Remove local `SCHOOL_COLORS`, use theme tokens |
| `components/InventoryList.tsx` | Modify | Use theme tokens instead of `ITEM_CATEGORY_COLORS` |
| `app/spell/[id].tsx` | Modify | Use theme tokens instead of `SPELL_SCHOOL_COLORS` |
| `app/item/[id].tsx` | Modify | Use theme tokens instead of `ITEM_CATEGORY_COLORS` |
| `components/EquipmentSlot.tsx` | Modify | Remove hardcoded `#1a1a1a` |
| `app/_layout.tsx` | Modify | Remove hardcoded `#F5E6C8` splash color |
| 22 component files with `#FFFFFF` | Modify | Replace with `theme.colors.textOnAccent` |
| All files using `+ '20'` / `+ '30'` etc. | Modify | Replace with `withOpacity()` calls |

---

## Unified Palette Design

### Light Theme (Fantasy) - One canonical value per hue:

| Role | Hex | Replaces |
|------|-----|----------|
| **red** | `#C41E3A` | `#C41E3A`, `#8B0000`, `#B22222` |
| **green** | `#228B22` | `#228B22` |
| **blue** | `#4169E1` | `#4169E1`, `#87CEEB` (air becomes blue-tinted) |
| **gold** | `#B8860B` | `#B8860B`, `#DAA520`, `#CD853F`, `#C9A227`, `#8B6914` |
| **purple** | `#6B3FA0` | `#6B3FA0`, `#9D4EDD`, `#9B59B6`, `#4A0E4E` |
| **brown** | `#8B4513` | `#8B4513` |
| **gray** | `#708090` | `#708090` |
| **parchment** | `#E8D9B5` | `#E8D9B5`, `#F5EDE0`, `#DDD0B8`, `#F5E6C8` |
| **ink** | `#2F1810` | `#2F1810`, `#6B4423` |

### Dark Theme (Dark Fantasy) - One canonical value per hue:

| Role | Hex | Replaces |
|------|-----|----------|
| **red** | `#E05555` | `#E05555`, `#8B0000`, `#B22222` |
| **green** | `#5DAE72` | `#5DAE72` |
| **blue** | `#6B8FE8` | `#4169E1` (brightened for dark bg), `#87CEEB` |
| **gold** | `#DAA520` | `#DAA520`, `#C9A227`, `#8B6914` |
| **purple** | `#9D7FD0` | `#6B3FA0` (brightened for dark bg), `#9D4EDD`, `#9B59B6` |
| **brown** | `#A0724E` | `#8B4513` (brightened for dark bg) |
| **gray** | `#8899A5` | `#708090` (brightened for dark bg) |
| **stone** | `#1C1C1C` | `#1C1C1C`, `#2D2D2D`, `#3D3D3D` |
| **parchment** | `#E8DCC4` | `#E8DCC4`, `#9A8C7B` |

---

### Task 1: Create palette and color utility files

**Files:**
- Create: `theme/palette.ts`
- Create: `theme/colorUtils.ts`

- [ ] **Step 1: Create the palette file**

```typescript
// theme/palette.ts
// Canonical color palette - ONE value per hue per theme.
// All semantic tokens in theme files derive from these.

export const lightPalette = {
  red: '#C41E3A',
  green: '#228B22',
  blue: '#4169E1',
  gold: '#B8860B',
  purple: '#6B3FA0',
  brown: '#8B4513',
  gray: '#708090',

  // Surface tones
  parchmentDark: '#DDD0B8',
  parchment: '#E8D9B5',
  parchmentLight: '#F5EDE0',

  // Text tones (derived from brown family)
  inkDark: '#2F1810',
  inkLight: '#6B4423',

  // Border tone
  tan: '#C4A574',

  // Neutral extremes
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const darkPalette = {
  red: '#E05555',
  green: '#5DAE72',
  blue: '#6B8FE8',
  gold: '#DAA520',
  purple: '#9D7FD0',
  brown: '#A0724E',
  gray: '#8899A5',

  // Surface tones
  stoneDark: '#1C1C1C',
  stone: '#2D2D2D',
  stoneLight: '#3D3D3D',

  // Text tones
  parchmentLight: '#E8DCC4',
  parchmentFaded: '#9A8C7B',

  // Border tone
  stoneBorder: '#4A4A4A',

  // Neutral extremes
  white: '#FFFFFF',
  black: '#000000',
} as const;
```

- [ ] **Step 2: Create the color utility file**

```typescript
// theme/colorUtils.ts
// Converts a hex color + decimal opacity (0-1) to an 8-digit hex string.
// Replaces the `color + '30'` pattern used throughout the codebase.

export function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alpha}`;
}
```

- [ ] **Step 3: Commit**

```bash
git add theme/palette.ts theme/colorUtils.ts
git commit -m "feat: add canonical color palette and withOpacity utility"
```

---

### Task 2: Expand ThemeColors interface with new semantic tokens

**Files:**
- Modify: `types/index.ts:166-184`

- [ ] **Step 1: Update the ThemeColors interface**

Replace the existing `ThemeColors` interface with this expanded version:

```typescript
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
  textOnAccent: string; // NEW: white text on colored backgrounds

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

  // Stat icons (NEW: moved from SHARED_COLORS)
  attack: string;
  defend: string;
  move: string;

  // Class portraits (NEW: moved from SHARED_COLORS / data/heroes.ts)
  classBarbarian: string;
  classDwarf: string;
  classElf: string;
  classWizard: string;

  // Spell schools (NEW: moved from SPELL_SCHOOL_COLORS)
  spellFire: string;
  spellWater: string;
  spellEarth: string;
  spellAir: string;

  // Item categories (NEW: moved from ITEM_CATEGORY_COLORS)
  itemPotion: string;
  itemTool: string;
  itemArtifact: string;
  itemMisc: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: expand ThemeColors with stat, class, spell, and item tokens"
```

---

### Task 3: Rebuild both theme files from palette

**Files:**
- Modify: `theme/fantasy.ts`
- Modify: `theme/darkFantasy.ts`

- [ ] **Step 1: Rewrite the light theme**

Replace the entire contents of `theme/fantasy.ts`:

```typescript
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

    // Stat icons — use same canonical hues
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
```

- [ ] **Step 2: Rewrite the dark theme**

Replace the entire contents of `theme/darkFantasy.ts`:

```typescript
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
    healthEmpty: '#3D2020',
    mind: p.purple,
    mindEmpty: '#2D1F3D',

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
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (both themes now satisfy the expanded `ThemeColors` interface)

- [ ] **Step 4: Commit**

```bash
git add theme/fantasy.ts theme/darkFantasy.ts
git commit -m "feat: rebuild both themes from unified palette"
```

---

### Task 4: Gut constants/colors.ts — remove hue constants

**Files:**
- Modify: `constants/colors.ts`

- [ ] **Step 1: Strip down to overlays and pure values only**

Replace the entire contents of `constants/colors.ts`:

```typescript
// Shared color constants — theme-independent only.
// All hue-based colors now live in the theme system.

export const OVERLAY_COLORS = {
  modalOverlay: 'rgba(0, 0, 0, 0.5)',
  pressedOverlay: 'rgba(0, 0, 0, 0.1)',
} as const;

export const PURE_COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add constants/colors.ts
git commit -m "refactor: strip constants/colors.ts to overlays and pure values"
```

---

### Task 5: Update data/heroes.ts to use theme-independent approach

**Files:**
- Modify: `data/heroes.ts`

- [ ] **Step 1: Remove hardcoded portraitColor values**

The `portraitColor` field in `HERO_CLASSES` is used by components to color portraits. Since components already have access to `theme`, we'll keep the field for backward compat but make components prefer `theme.colors.class*` tokens. The `portraitColor` values stay as fallbacks but are sourced from the light palette:

```typescript
import { HeroClassStats, HeroClassName } from '@/types';
import { lightPalette } from '@/theme/palette';

export const HERO_CLASSES: Record<HeroClassName, HeroClassStats> = {
  Barbarian: {
    name: 'Barbarian',
    baseAttack: 3,
    baseDefend: 2,
    baseMove: 2,
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
    baseMove: 2,
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
    baseMove: 2,
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
    baseMove: 2,
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
```

- [ ] **Step 2: Commit**

```bash
git add data/heroes.ts
git commit -m "refactor: source hero portrait colors from palette"
```

---

### Task 6: Migrate StatBlock.tsx — replace SHARED_COLORS with theme tokens

**Files:**
- Modify: `components/StatBlock.tsx:6,53,59,66,72,79,85`

- [ ] **Step 1: Replace SHARED_COLORS import and usages**

Remove:
```typescript
import { SHARED_COLORS } from '@/constants/colors';
```

The component already has access to `theme` via `useTheme()`. Replace every `SHARED_COLORS.attackIcon` with `theme.colors.attack`, every `SHARED_COLORS.defendIcon` with `theme.colors.defend`, every `SHARED_COLORS.moveIcon` with `theme.colors.move`.

Specifically, the 6 occurrences:
- `color={SHARED_COLORS.attackIcon}` -> `color={theme.colors.attack}`
- `color={SHARED_COLORS.attackIcon}` -> `color={theme.colors.attack}`
- `color={SHARED_COLORS.defendIcon}` -> `color={theme.colors.defend}`
- `color={SHARED_COLORS.defendIcon}` -> `color={theme.colors.defend}`
- `color={SHARED_COLORS.moveIcon}` -> `color={theme.colors.move}`
- `color={SHARED_COLORS.moveIcon}` -> `color={theme.colors.move}`

- [ ] **Step 2: Commit**

```bash
git add components/StatBlock.tsx
git commit -m "refactor: StatBlock uses theme tokens for stat colors"
```

---

### Task 7: Migrate SpellTracker.tsx and spell/[id].tsx — replace SPELL_SCHOOL_COLORS

**Files:**
- Modify: `components/SpellTracker.tsx:7,20,87`
- Modify: `app/spell/[id].tsx:14,44`

- [ ] **Step 1: Create a helper to map SpellSchool to theme color**

In both files, replace the `SPELL_SCHOOL_COLORS` import and usage. Add a local helper (or use inline):

For `components/SpellTracker.tsx`, remove the import:
```typescript
import { SPELL_SCHOOL_COLORS } from '@/constants/colors';
```

Add a helper inside the file (above the components):
```typescript
const getSchoolColor = (school: SpellSchool, colors: ThemeColors): string => {
  const map: Record<SpellSchool, string> = {
    Fire: colors.spellFire,
    Water: colors.spellWater,
    Earth: colors.spellEarth,
    Air: colors.spellAir,
  };
  return map[school];
};
```

Then replace:
- `SPELL_SCHOOL_COLORS[spell.school]` -> `getSchoolColor(spell.school, theme.colors)`
- `SPELL_SCHOOL_COLORS[school]` -> `getSchoolColor(school, theme.colors)`

Add `ThemeColors` to the import from `@/types` if not already imported.

- [ ] **Step 2: Do the same for app/spell/[id].tsx**

Remove:
```typescript
import { SPELL_SCHOOL_COLORS } from '@/constants/colors';
```

Add the same `getSchoolColor` helper. Replace:
- `SPELL_SCHOOL_COLORS[spell.school]` -> `getSchoolColor(spell.school, theme.colors)`

- [ ] **Step 3: Commit**

```bash
git add components/SpellTracker.tsx app/spell/\[id\].tsx
git commit -m "refactor: spell components use theme tokens for school colors"
```

---

### Task 8: Migrate HeroSwitcher.tsx — remove local SCHOOL_COLORS

**Files:**
- Modify: `components/HeroSwitcher.tsx:20-24,330`

- [ ] **Step 1: Remove the local SCHOOL_COLORS constant**

Delete lines 20-25:
```typescript
const SCHOOL_COLORS: Record<SpellSchool, string> = {
  Air: '#87CEEB',
  Earth: '#8B4513',
  Fire: '#FF4500',
  Water: '#4169E1',
};
```

Add the same `getSchoolColor` helper from Task 7, or import `ThemeColors` and inline it.

Replace `SCHOOL_COLORS[school]` with `getSchoolColor(school, theme.colors)`.

- [ ] **Step 2: Also replace any `classData.portraitColor` usages with theme tokens**

There are ~10 usages of `classData.portraitColor` in this file. Create a helper:

```typescript
const getClassColor = (className: HeroClassName, colors: ThemeColors): string => {
  const map: Record<HeroClassName, string> = {
    Barbarian: colors.classBarbarian,
    Dwarf: colors.classDwarf,
    Elf: colors.classElf,
    Wizard: colors.classWizard,
  };
  return map[className];
};
```

Replace each `classData.portraitColor` with `getClassColor(classData.name, theme.colors)`.

- [ ] **Step 3: Commit**

```bash
git add components/HeroSwitcher.tsx
git commit -m "refactor: HeroSwitcher uses theme tokens for school and class colors"
```

---

### Task 9: Migrate InventoryList.tsx and item/[id].tsx — replace ITEM_CATEGORY_COLORS

**Files:**
- Modify: `components/InventoryList.tsx:15,28`
- Modify: `app/item/[id].tsx:14,51`

- [ ] **Step 1: Replace ITEM_CATEGORY_COLORS in InventoryList.tsx**

Remove:
```typescript
import { ITEM_CATEGORY_COLORS } from '@/constants/colors';
```

Add a helper:
```typescript
const getCategoryColor = (category: ItemCategory, colors: ThemeColors): string => {
  const map: Record<ItemCategory, string> = {
    potion: colors.itemPotion,
    tool: colors.itemTool,
    artifact: colors.itemArtifact,
    misc: colors.itemMisc,
  };
  return map[category];
};
```

Replace `ITEM_CATEGORY_COLORS[item.category]` with `getCategoryColor(item.category, theme.colors)`.

- [ ] **Step 2: Same for app/item/[id].tsx**

Remove the import, add the helper, replace the usage.

- [ ] **Step 3: Commit**

```bash
git add components/InventoryList.tsx app/item/\[id\].tsx
git commit -m "refactor: inventory components use theme tokens for category colors"
```

---

### Task 10: Migrate remaining portrait color usages

**Files:**
- Modify: `components/HeroIdentity.tsx:58,59,66`
- Modify: `components/PlaceholderPortrait.tsx:27`

- [ ] **Step 1: Update HeroIdentity.tsx**

This component uses `classData.portraitColor`. It already has `theme` from `useTheme()`. Add the `getClassColor` helper (same as Task 8) and replace:
- `classData.portraitColor + '20'` -> `withOpacity(getClassColor(classData.name, theme.colors), 0.12)`
- `classData.portraitColor` (border) -> `getClassColor(classData.name, theme.colors)`
- `classData.portraitColor` (background) -> `getClassColor(classData.name, theme.colors)`

Import `withOpacity` from `@/theme/colorUtils`.

- [ ] **Step 2: Update PlaceholderPortrait.tsx**

Replace `classData.portraitColor` with theme-based class color. This component needs `theme` — if it doesn't have it, add `const { theme } = useTheme();` and the helper.

- [ ] **Step 3: Commit**

```bash
git add components/HeroIdentity.tsx components/PlaceholderPortrait.tsx
git commit -m "refactor: portrait components use theme tokens for class colors"
```

---

### Task 11: Replace all hardcoded #FFFFFF with theme.colors.textOnAccent

**Files:**
- Modify: All 22 component files listed in the grep results that use `color="#FFFFFF"` or `color: '#FFFFFF'`

The full list:
- `components/InventoryList.tsx` (lines 130, 267)
- `components/QuestProgress.tsx` (line 82)
- `components/ArmoryList.tsx` (lines 198, 287, 430)
- `app/onboarding.tsx` (lines 170, 288)
- `components/HeroSwitcher.tsx` (lines 287, 405, 545, 597, 626, 669, 714)
- `components/ConflictResolver.tsx` (line 368)
- `components/HeroIdentity.tsx` (line 129)
- `app/index.tsx` (lines 99, 121, 126, 498)
- `app/quest/[id].tsx` (lines 100, 224)
- `components/EquipmentSlot.tsx` — no #FFFFFF, skip
- `app/auth.tsx` (lines 302, 365, 462, 488)
- `app/spell/[id].tsx` (lines 101, 242)
- `components/GoldCounter.tsx` (line 84, 172)
- `components/PlaceholderPortrait.tsx` (line 37)
- `app/item/[id].tsx` (lines 130, 328)

- [ ] **Step 1: In each file, replace `'#FFFFFF'` and `"#FFFFFF"` with `theme.colors.textOnAccent`**

For inline JSX props like `color="#FFFFFF"`, change to `color={theme.colors.textOnAccent}`.
For style objects like `color: '#FFFFFF'`, change to `color: theme.colors.textOnAccent`.

Ensure each component has `const { theme } = useTheme();` (most already do).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/ app/
git commit -m "refactor: replace hardcoded #FFFFFF with theme.colors.textOnAccent"
```

---

### Task 12: Replace all hex-suffix opacity hacks with withOpacity()

**Files:**
- Modify: All files using the `+ '30'`, `+ '20'`, `+ '10'`, `+ '40'`, `+ '60'`, `+ '80'` pattern

The full list (from grep):
- `components/GoldCounter.tsx` (6 occurrences)
- `app/index.tsx` (2 occurrences)
- `components/ConflictResolver.tsx` (4 occurrences)
- `app/auth.tsx` (3 occurrences)
- `components/ArmoryList.tsx` (3 occurrences)
- `app/item/[id].tsx` (6 occurrences)
- `components/EquipmentSlot.tsx` (4 occurrences)
- `app/quest/[id].tsx` (2 occurrences)
- `components/HeroSwitcher.tsx` (3 occurrences - after Task 8 these use theme tokens)
- `components/EquipmentSelector.tsx` (1 occurrence)
- `components/SpellTracker.tsx` (1 occurrence)
- `app/spell/[id].tsx` (3 occurrences)
- `components/HeroIdentity.tsx` (1 occurrence - done in Task 10)

- [ ] **Step 1: Add import to each file**

```typescript
import { withOpacity } from '@/theme/colorUtils';
```

- [ ] **Step 2: Replace each pattern**

Conversion table for hex suffix -> decimal opacity:
- `+ '10'` -> `withOpacity(color, 0.06)` (16/255 ~ 0.06)
- `+ '20'` -> `withOpacity(color, 0.13)` (32/255 ~ 0.13)
- `+ '30'` -> `withOpacity(color, 0.19)` (48/255 ~ 0.19)
- `+ '40'` -> `withOpacity(color, 0.25)` (64/255 ~ 0.25)
- `+ '60'` -> `withOpacity(color, 0.38)` (96/255 ~ 0.38)
- `+ '80'` -> `withOpacity(color, 0.50)` (128/255 ~ 0.50)

Example transforms:
- `theme.colors.danger + '30'` -> `withOpacity(theme.colors.danger, 0.19)`
- `theme.colors.accent + '20'` -> `withOpacity(theme.colors.accent, 0.13)`
- `schoolColor + '40'` -> `withOpacity(schoolColor, 0.25)`

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add components/ app/
git commit -m "refactor: replace hex-suffix opacity hacks with withOpacity()"
```

---

### Task 13: Fix remaining hardcoded colors in components

**Files:**
- Modify: `components/EquipmentSlot.tsx:92`
- Modify: `app/_layout.tsx:167`
- Modify: `components/QuestProgress.tsx:124`
- Modify: `components/HeroSwitcher.tsx:704`
- Modify: `app/auth.tsx:549`

- [ ] **Step 1: Fix EquipmentSlot.tsx**

Replace:
```typescript
backgroundColor: theme.isDark ? '#1a1a1a' : theme.colors.surfaceVariant,
```
With:
```typescript
backgroundColor: theme.colors.surfaceVariant,
```
(The dark theme's `surfaceVariant` is already `#3D3D3D` which is close enough; the `#1a1a1a` override is unnecessary now that both themes define proper surface variants.)

- [ ] **Step 2: Fix app/_layout.tsx splash color**

Replace:
```typescript
backgroundColor: '#F5E6C8',
```
With:
```typescript
backgroundColor: '#E8D9B5',
```
(Use the canonical parchment color from the light palette. This is a static splash screen value — it can't use theme context, so a hardcoded reference to the light palette default is acceptable.)

- [ ] **Step 3: Replace inline rgba() overlays with OVERLAY_COLORS**

In `components/QuestProgress.tsx:124`:
```typescript
backgroundColor: 'rgba(0,0,0,0.1)',
```
-> `backgroundColor: OVERLAY_COLORS.pressedOverlay,`

In `components/HeroSwitcher.tsx:704`:
```typescript
borderBottomColor: 'rgba(255,255,255,0.1)',
```
-> `borderBottomColor: withOpacity(theme.colors.textOnAccent, 0.06),`

In `app/auth.tsx:549`:
```typescript
backgroundColor: 'rgba(0,0,0,0.3)',
```
-> `backgroundColor: 'rgba(0,0,0,0.3)',` (keep — this is a modal overlay, slightly different from the standard 0.5 overlay; or replace with `withOpacity('#000000', 0.3)`)

In `components/GoldCounter.tsx:236`:
```typescript
backgroundColor: 'rgba(0, 0, 0, 0.5)',
```
-> `backgroundColor: OVERLAY_COLORS.modalOverlay,`

Import `OVERLAY_COLORS` from `@/constants/colors` in the affected files.

- [ ] **Step 4: Commit**

```bash
git add components/EquipmentSlot.tsx app/_layout.tsx components/QuestProgress.tsx components/HeroSwitcher.tsx app/auth.tsx components/GoldCounter.tsx
git commit -m "refactor: eliminate remaining hardcoded colors"
```

---

### Task 14: Clean up unused imports and verify build

**Files:**
- All modified files

- [ ] **Step 1: Search for stale imports**

Run: `grep -rn "SHARED_COLORS\|SPELL_SCHOOL_COLORS\|ITEM_CATEGORY_COLORS" --include="*.tsx" --include="*.ts" .`

Expected: No results in component/app files. Only `constants/colors.ts` should NOT contain these anymore either.

- [ ] **Step 2: Search for any remaining raw hex colors in components**

Run: `grep -rn "#[0-9A-Fa-f]\{6\}" --include="*.tsx" .`

Expected: Only `app/_layout.tsx` splash screen should have a raw hex. Everything else should go through theme or palette.

- [ ] **Step 3: Full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Start dev server and visually verify**

Run: `npx expo start`

Check in both light and dark mode:
- Hero portraits show correct class colors
- Stat icons (attack/defend/move) have correct colors
- Spell school headers show distinct colors
- Item categories show distinct colors
- Health/mind trackers display correctly
- Gold counter works with +/- buttons
- All button text is readable (white on colored backgrounds)
- Modal overlays are semi-transparent
- No invisible or illegible text

- [ ] **Step 5: Commit any cleanup fixes**

```bash
git add -A
git commit -m "chore: clean up unused imports and verify build"
```

---

## Summary

| Before | After |
|--------|-------|
| ~80 distinct hex values | ~20 palette values + semantic tokens |
| 3 color definition layers (theme, constants, inline) | 1 layer (theme) + palette source of truth |
| Colors don't adapt to dark mode (stats, spells, items) | All colors are theme-aware |
| Fire spell has 2 different hex values | One canonical red per theme |
| 5 different gold/tan shades | One canonical gold per theme |
| Opacity via string concatenation (`+ '30'`) | `withOpacity()` utility with decimal values |
| Hardcoded `#FFFFFF` in 22 files | `theme.colors.textOnAccent` token |
| Class portrait colors duplicated in 2 files | Single source from palette |
