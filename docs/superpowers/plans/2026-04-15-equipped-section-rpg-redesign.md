# Equipped Section RPG Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the equipped section from a flat vertical list into a spatial cross-pattern layout with rarity-driven visual treatment and artifact pulse animation.

**Architecture:** Extract a new `EquipmentSlot` component from the existing `EquipmentSelector`. The slot handles its own rarity-tier styling (normal / artifact / empty) and artifact pulse animation via `react-native-reanimated`. The parent `EquipmentSelector` switches from a vertical stack of `EquipmentRow` components to a cross-pattern layout (helmet top-center, weapon-armor-shield middle row).

**Tech Stack:** React Native, react-native-reanimated v4, expo-haptics, @gorhom/bottom-sheet (unchanged), @expo/vector-icons

**Spec:** `docs/superpowers/specs/2026-04-15-equipped-section-rpg-redesign.md`

**No test framework:** This project has no test runner configured. Tasks include manual verification via the Expo dev server instead of automated tests.

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `components/EquipmentSlot.tsx` | Individual equipment slot card — rarity styling, artifact pulse, press handling |
| Modify | `components/EquipmentSelector.tsx` | Replace `EquipmentRow` vertical list with cross-pattern layout using `EquipmentSlot` |

---

### Task 1: Create the EquipmentSlot component with normal and empty tier styling

**Files:**
- Create: `components/EquipmentSlot.tsx`

This task builds the slot card component with two of the three visual tiers: normal items and empty slots. Artifact treatment comes in Task 2.

- [ ] **Step 1: Create `components/EquipmentSlot.tsx` with types and props**

```tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { ITEM_CATEGORY_COLORS } from '@/constants/colors';
import { Weapon, Shield, Helmet, Armor, EquipmentSlot as SlotType } from '@/types';
import * as Haptics from 'expo-haptics';

type EquipmentItem = Weapon | Shield | Helmet | Armor;

interface EquipmentSlotProps {
  slotType: SlotType;
  item: EquipmentItem | null;
  isArtifact: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

const SLOT_ICONS: Record<SlotType, { family: 'mci' | 'fa5'; name: string; size: number }> = {
  weapon: { family: 'mci', name: 'sword', size: 26 },
  shield: { family: 'fa5', name: 'shield-alt', size: 22 },
  helmet: { family: 'mci', name: 'hard-hat', size: 26 },
  armor: { family: 'mci', name: 'tshirt-crew', size: 26 },
};

const SLOT_LABELS: Record<SlotType, string> = {
  weapon: 'Weapon',
  shield: 'Shield',
  helmet: 'Helmet',
  armor: 'Armor',
};

function getStatText(slotType: SlotType, item: EquipmentItem): string {
  if (slotType === 'weapon') {
    return `${(item as Weapon).attackDice} ATK`;
  }
  const defItem = item as Shield | Helmet | Armor;
  return defItem.defendDice > 0 ? `+${defItem.defendDice} DEF` : '';
}

function SlotIcon({ slotType, color, opacity }: { slotType: SlotType; color: string; opacity: number }) {
  const config = SLOT_ICONS[slotType];
  if (config.family === 'fa5') {
    return <FontAwesome5 name={config.name} size={config.size} color={color} style={{ opacity }} />;
  }
  return <MaterialCommunityIcons name={config.name as any} size={config.size} color={color} style={{ opacity }} />;
}

export const EquipmentSlotCard: React.FC<EquipmentSlotProps> = ({
  slotType,
  item,
  isArtifact,
  isDisabled,
  onPress,
}) => {
  const { theme } = useTheme();
  const isEmpty = item === null;

  const handlePress = async () => {
    if (isDisabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // --- Disabled state (shield blocked by 2H weapon) ---
  if (isDisabled) {
    return (
      <View style={[styles.slot, styles.slotMiddle, {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border + '40',
        borderStyle: 'dashed' as any,
        borderWidth: 1.5,
        opacity: 0.5,
      }]}>
        <SlotIcon slotType={slotType} color={theme.colors.textSecondary} opacity={0.2} />
        <Text style={[styles.slotLabel, { color: theme.colors.textSecondary }]}>
          {SLOT_LABELS[slotType]}
        </Text>
        <View style={styles.blockedRow}>
          <Ionicons name="lock-closed" size={10} color={theme.colors.textSecondary} />
          <Text style={[styles.blockedText, { color: theme.colors.textSecondary }]}>Blocked</Text>
        </View>
      </View>
    );
  }

  // --- Empty state ---
  if (isEmpty) {
    return (
      <Pressable
        onPress={handlePress}
        style={[styles.slot, slotType === 'helmet' ? styles.slotHelmet : styles.slotMiddle, {
          backgroundColor: theme.isDark ? '#1a1a1a' : theme.colors.surfaceVariant,
          borderColor: theme.colors.border + '80',
          borderStyle: 'dashed' as any,
          borderWidth: 1.5,
        }]}
      >
        <SlotIcon slotType={slotType} color={theme.colors.textSecondary} opacity={0.3} />
        <Text style={[styles.slotLabel, { color: theme.colors.textSecondary + '80' }]}>
          {SLOT_LABELS[slotType]}
        </Text>
        <Text style={[styles.emptyName, { color: theme.colors.textSecondary + '60' }]}>
          No {SLOT_LABELS[slotType].toLowerCase()}
        </Text>
      </Pressable>
    );
  }

  // --- Normal item state (non-artifact) ---
  // Artifact state will be added in Task 2
  return (
    <Pressable
      onPress={handlePress}
      style={[styles.slot, slotType === 'helmet' ? styles.slotHelmet : styles.slotMiddle, {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1.5,
      }]}
    >
      <SlotIcon slotType={slotType} color={theme.colors.accent} opacity={1} />
      <Text style={[styles.slotLabel, { color: theme.colors.textSecondary }]}>
        {SLOT_LABELS[slotType]}
      </Text>
      <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
        {getStatText(slotType, item)}
      </Text>
      {(item as Weapon).twoHanded && (
        <Text style={[styles.badge, { color: theme.colors.accent }]}>2H</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  slotHelmet: {
    width: 180,
    alignSelf: 'center',
  },
  slotMiddle: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyName: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  statText: {
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  blockedText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
```

- [ ] **Step 2: Verify it compiles**

Run: `npx expo start` and check for compilation errors in the terminal. The component isn't wired in yet, so no visual check.

- [ ] **Step 3: Commit**

```bash
git add components/EquipmentSlot.tsx
git commit -m "feat: add EquipmentSlot component with normal and empty tier styling"
```

---

### Task 2: Add artifact tier styling with pulse animation

**Files:**
- Modify: `components/EquipmentSlot.tsx`

Add the artifact visual tier: purple border, background tint, glow shadow, sparkle indicator on the label, and a slow pulse animation on the glow using `react-native-reanimated`.

- [ ] **Step 1: Add reanimated imports and accessibility check**

At the top of `components/EquipmentSlot.tsx`, add:

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
```

Update the existing `React` import to remove `useEffect`/`useState` if they were added there (they weren't in our original — just keep the new imports clean).

- [ ] **Step 2: Add the artifact pulse hook**

Add this custom hook inside `EquipmentSlot.tsx`, above the `EquipmentSlotCard` component:

```tsx
function useArtifactPulse(isArtifact: boolean): Animated.SharedValue<number> {
  const glowOpacity = useSharedValue(0.15);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    return () => listener.remove();
  }, []);

  useEffect(() => {
    if (isArtifact && !reduceMotion) {
      glowOpacity.value = withRepeat(
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );
    } else {
      glowOpacity.value = isArtifact ? 0.3 : 0.15;
    }
  }, [isArtifact, reduceMotion]);

  return glowOpacity;
}
```

- [ ] **Step 3: Add artifact rendering branch to `EquipmentSlotCard`**

Replace the normal item return block (the comment says `// Artifact state will be added in Task 2`) with a branch that checks `isArtifact`. Insert this **before** the normal return, after the empty state block:

```tsx
  const artifactColor = ITEM_CATEGORY_COLORS.artifact;
  const glowOpacity = useArtifactPulse(isArtifact);

  const artifactGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));

  // --- Artifact item state ---
  if (isArtifact) {
    const artifactNameColor = theme.isDark ? '#c9a0dc' : '#7B3FA0';
    return (
      <Animated.View
        style={[
          styles.slot,
          slotType === 'helmet' ? styles.slotHelmet : styles.slotMiddle,
          {
            backgroundColor: artifactColor + '14',
            borderColor: artifactColor,
            borderWidth: 2,
            shadowColor: artifactColor,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 12,
            elevation: 8,
          },
          artifactGlowStyle,
        ]}
      >
        <Pressable onPress={handlePress} style={styles.artifactPressable}>
          <SlotIcon slotType={slotType} color={artifactColor} opacity={1} />
          <Text style={[styles.slotLabel, { color: artifactColor }]}>
            {SLOT_LABELS[slotType]} ✦
          </Text>
          <Text style={[styles.itemName, { color: artifactNameColor }]} numberOfLines={1}>
            {item!.name}
          </Text>
          <Text style={[styles.statText, { color: artifactColor + 'AA' }]}>
            {getStatText(slotType, item!)}
          </Text>
          <Text style={[styles.artifactBadge, { color: artifactColor }]}>Artifact</Text>
        </Pressable>
      </Animated.View>
    );
  }
```

- [ ] **Step 4: Add the `artifactPressable` and `artifactBadge` styles**

Add to the `StyleSheet.create` block:

```tsx
  artifactPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  artifactBadge: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
```

- [ ] **Step 5: Move the `artifactColor` and hooks above the early returns**

The `useArtifactPulse` hook and `useAnimatedStyle` must be called unconditionally (React rules of hooks). Restructure the component so these calls are at the top of the component body, before any `if (isDisabled)` or `if (isEmpty)` early returns. The disabled and empty branches simply won't use the animated values.

Move these lines to right after `const isEmpty = item === null;`:

```tsx
  const artifactColor = ITEM_CATEGORY_COLORS.artifact;
  const glowOpacity = useArtifactPulse(isArtifact);
  const artifactGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
  }));
```

- [ ] **Step 6: Verify compilation**

Run: `npx expo start` — check for no errors. Component still not wired in.

- [ ] **Step 7: Commit**

```bash
git add components/EquipmentSlot.tsx
git commit -m "feat: add artifact tier styling with pulsing glow animation"
```

---

### Task 3: Rewire EquipmentSelector to cross-pattern layout

**Files:**
- Modify: `components/EquipmentSelector.tsx:30-75,174-208,290-328`

Replace the `EquipmentRow` component and its vertical usage with the new `EquipmentSlotCard` in a cross-pattern layout. Keep all bottom sheet logic untouched.

- [ ] **Step 1: Update imports**

At the top of `components/EquipmentSelector.tsx`, replace:

```tsx
import { Weapon, Shield, Helmet, Armor, EquipmentSlot } from '@/types';
```

with:

```tsx
import { Weapon, Shield, Helmet, Armor, EquipmentSlot } from '@/types';
import { EquipmentSlotCard } from './EquipmentSlot';
```

- [ ] **Step 2: Remove the `EquipmentRow` component and its interface**

Delete lines 19-75 entirely (the `EquipmentItem` type alias, `EquipmentRowProps` interface, and `EquipmentRow` component). Keep the `EquipmentItem` type alias by moving it into the body of `EquipmentSelector` or above it:

```tsx
type EquipmentItem = Weapon | Shield | Helmet | Armor;
```

- [ ] **Step 3: Replace the equipment rows with the cross-pattern layout**

Replace the four `<EquipmentRow ... />` blocks (the section between the `EQUIPPED` title and the `<BottomSheetModal>`) with:

```tsx
      {/* Top row: Helmet */}
      <View style={styles.topRow}>
        <EquipmentSlotCard
          slotType="helmet"
          item={hero.equipment.helmet}
          isArtifact={false}
          isDisabled={false}
          onPress={() => openSelector('helmet')}
        />
      </View>

      {/* Middle row: Weapon - Armor - Shield */}
      <View style={styles.middleRow}>
        <EquipmentSlotCard
          slotType="weapon"
          item={hero.equipment.weapon}
          isArtifact={hero.equipment.weapon?.isArtifact ?? false}
          isDisabled={false}
          onPress={() => openSelector('weapon')}
        />
        <EquipmentSlotCard
          slotType="armor"
          item={hero.equipment.armor}
          isArtifact={false}
          isDisabled={false}
          onPress={() => openSelector('armor')}
        />
        <EquipmentSlotCard
          slotType="shield"
          item={hero.equipment.shield}
          isArtifact={false}
          isDisabled={isShieldDisabled}
          onPress={() => openSelector('shield')}
        />
      </View>
```

- [ ] **Step 4: Update the styles**

Remove the old `EquipmentRow`-related styles (`equipmentRow`, `equipmentIcon`, `equipmentInfo`, `equipmentLabel`, `equipmentValue`, `twoHandedBadge`). Add the new cross-pattern styles:

```tsx
  topRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  middleRow: {
    flexDirection: 'row',
    gap: 8,
  },
```

- [ ] **Step 5: Remove unused imports**

Remove `MaterialCommunityIcons`, `FontAwesome5` from imports — icons are now handled inside `EquipmentSlot.tsx`. Keep `Ionicons` (still used in the bottom sheet). Remove `ITEM_CATEGORY_COLORS` import if no longer used directly.

- [ ] **Step 6: Verify on device**

Run: `npx expo start` — open the app on a device or simulator. Verify:
- Helmet slot appears centered at the top
- Weapon, Armor, Shield appear in a row below
- Empty slots show dashed borders with ghosted icons
- Equipped normal items show solid borders with item names
- If an artifact weapon is equipped, it shows purple glow with pulse
- Shield slot shows "Blocked" when a 2H weapon is equipped
- Tapping any slot opens the existing bottom sheet selector
- Both themes (light/dark) render correctly

- [ ] **Step 7: Commit**

```bash
git add components/EquipmentSelector.tsx
git commit -m "feat: replace equipped section with cross-pattern RPG layout"
```

---

### Task 4: Polish and edge cases

**Files:**
- Modify: `components/EquipmentSlot.tsx`
- Modify: `components/EquipmentSelector.tsx`

Final pass for visual polish and edge case handling.

- [ ] **Step 1: Handle long item names**

In `EquipmentSlot.tsx`, the `itemName` style already has `numberOfLines={1}`. Verify that names like "Wizard's Staff of Power" truncate gracefully on the 140pt-wide middle slots. If the helmet slot (180pt) also needs truncation, it's already covered.

- [ ] **Step 2: Verify two-handed weapon flow end-to-end**

1. Equip a two-handed weapon (e.g., "Staff" or "Battle Axe")
2. Verify Shield slot shows locked/blocked state
3. Switch to a one-handed weapon
4. Verify Shield slot returns to empty (tappable) state

- [ ] **Step 3: Verify artifact equip flow**

1. Equip an artifact weapon (e.g., Spirit Blade — requires having it in inventory)
2. Verify purple border, glow, pulse animation on the weapon slot
3. Verify normal items in other slots don't get artifact treatment
4. Unequip the artifact — verify slot returns to empty state

- [ ] **Step 4: Test both themes**

Toggle between Fantasy (light) and Dark Fantasy (dark) themes. Verify:
- Normal slot borders and backgrounds match each theme
- Artifact purple name color: `#c9a0dc` on dark, `#7B3FA0` on light
- Empty slots use appropriate muted colors per theme
- The artifact glow is visible against both backgrounds

- [ ] **Step 5: Commit**

```bash
git add components/EquipmentSlot.tsx components/EquipmentSelector.tsx
git commit -m "fix: polish equipped section edge cases and theme consistency"
```
