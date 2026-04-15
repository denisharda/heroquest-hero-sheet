# Equipped Section RPG Redesign

## Overview

Redesign the equipped section of the HeroQuest hero sheet from a flat vertical list into a spatial cross-pattern layout with rarity-driven visual treatment and subtle artifact animations. The goal is to make the equipment display feel like an RPG inventory screen while keeping the existing selection flow (bottom sheets) unchanged.

## Layout

### Cross Pattern

```
          [Helmet]
[Weapon]  [Armor]  [Shield]
```

- **Top row**: Helmet slot, horizontally centered
- **Middle row**: Weapon (left), Armor (center), Shield (right), in a flex row
- Armor occupies the center position as the "body" piece
- Negative space between rows — no hero silhouette, no center emblem
- Section header "EQUIPPED" remains above the layout

### Slot Sizing

- Middle row slots: ~140pt wide each
- Helmet slot: ~180pt wide, centered above the middle row
- Internal layout per slot: icon (left, ~26pt) + text block (slot label, item name, stat bonus)
- Slots are vertically padded (~12pt) with 10pt horizontal gap between middle row items

### Two-Handed Weapon Handling

When a two-handed weapon is equipped, the Shield slot becomes visually disabled:
- Border changes to dashed, more muted than an empty slot
- Icon greys out further (20% opacity)
- Shows a small lock icon or "Blocked" text instead of "No shield"
- Slot is not tappable while blocked

## Visual Treatment (Rarity-Driven)

Three tiers of visual treatment based on item type:

### Normal Items

- Border: 1.5px solid `theme.colors.border`
- Background: `theme.colors.surface`
- Icon and item name in standard theme text colors
- Stat bonus in `theme.colors.textSecondary`
- No animation

### Artifact Items (`isArtifact: true`)

- Border: 2px solid `#9B59B6` (existing artifact purple from `ITEM_CATEGORY_COLORS.artifact`)
- Background: `#9B59B6` at 8% opacity
- Item name in lighter purple (`#c9a0dc` on dark theme, `#7B3FA0` on light theme for contrast against parchment background)
- Slot label includes a sparkle indicator (star icon or similar)
- Outer glow shadow: `0 0 12px rgba(155, 89, 182, 0.3)`
- Pulse animation on the glow (see Animation section)

### Empty Slots

- Border: 1.5px dashed, muted (`theme.colors.border` at 50% opacity)
- Background: slightly darker/lighter than surface depending on theme
- Ghost icon at 30% opacity
- Slot label visible (e.g., "Shield"), item text shows "No shield" in most muted color
- Tappable — opens the bottom sheet to equip something

All tiers adapt to both Fantasy (light) and Dark Fantasy (dark) themes. The artifact purple (`#9B59B6`) is consistent across both themes; all other colors pull from the active theme context.

## Animation

### Artifact Pulse

- Library: `react-native-reanimated` (already installed, currently unused in equipment components)
- Effect: the outer glow/shadow opacity oscillates between 0.15 and 0.4
- Timing: ~3 second full cycle using `withRepeat(withTiming(...))` 
- Easing: `Easing.inOut(Easing.sin)` for smooth breathing feel
- Only active on slots containing artifact items
- Respects `AccessibilityInfo.isReduceMotionEnabled` — skips animation if the user has reduce motion enabled

### No Other Animations

- No equip/unequip transitions
- No empty slot shimmer
- No entrance/mount animations
- No press-in scale or opacity changes beyond what Pressable provides natively

## Component Architecture

### Refactoring Approach

Restructure the existing `EquipmentSelector.tsx` — same file, new internals. Extract an `EquipmentSlot` component for the individual slot card.

### Component Tree

```
EquipmentSelector (container)
  Section header ("EQUIPPED")
  Top row (centered)
    EquipmentSlot (helmet)
  Middle row (flex-row, 3 items)
    EquipmentSlot (weapon)
    EquipmentSlot (armor)  
    EquipmentSlot (shield)
```

### EquipmentSlot Component

**Props:**
- `slotType`: `'weapon' | 'shield' | 'helmet' | 'armor'`
- `item`: the equipped item object or `null`
- `isArtifact`: `boolean`
- `isDisabled`: `boolean` (shield slot when 2H weapon equipped)
- `onPress`: callback to open the bottom sheet

**Responsibilities:**
- Renders the slot card with appropriate rarity-tier styling
- Manages the artifact pulse animation (if applicable)
- Displays icon, slot label, item name, and stat bonus
- Handles disabled state for blocked shield slot

### What Stays Unchanged

- All bottom sheet modals and gear selection logic in `EquipmentSelector.tsx`
- `useHero()` store integration and equipment actions
- Stat calculation logic in `useHero.ts`
- The section's position in the main screen scroll order (`app/index.tsx`)
- Haptic feedback on press (`expo-haptics` Light impact)

## Scope

### In Scope

- New cross-pattern layout for the equipped section
- Rarity-driven visual treatment (normal / artifact / empty)
- Artifact pulse glow animation
- Two-handed weapon shield-blocking visual state
- Both theme support (Fantasy light + Dark Fantasy dark)
- Accessibility: reduce motion support

### Out of Scope

- Bottom sheet redesign (selection flow stays as-is)
- Armory list or inventory list changes
- New item types or data model changes
- Sound effects
- Full-screen equipment picker
