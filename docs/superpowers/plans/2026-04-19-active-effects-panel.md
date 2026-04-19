# Active Effects Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bottom-sheet panel on the hero screen that lists every active modifier from equipped gear and owned artifacts in one place.

**Architecture:** Pure function `getActiveEffects(hero)` walks `hero.equipment` and `hero.inventory` to produce two grouped lists (gear, artifacts). A small tappable row beneath the existing `StatBlock` opens a `@gorhom/bottom-sheet` modal rendering the two sections. Data-side, add an optional `shortEffect?: string` to `ItemDefinition` and fill it in for five non-equippable core artifacts.

**Tech Stack:** React Native (Expo SDK 54), TypeScript, `@gorhom/bottom-sheet` (already wired in [app/_layout.tsx](../../../app/_layout.tsx) via `BottomSheetModalProvider`), existing `useTheme`, `useHero`, and `StatBlock` patterns.

**Spec:** [docs/superpowers/specs/2026-04-19-active-effects-panel-design.md](../specs/2026-04-19-active-effects-panel-design.md)

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| [data/items.ts](../../../data/items.ts) | modify | Add `shortEffect?: string` to `ItemDefinition`; populate for 5 non-equippable artifacts |
| `lib/activeEffects.ts` | **new** | Pure `getActiveEffects(hero)` function + `ActiveEffectRow` type |
| `components/ActiveEffectsButton.tsx` | **new** | Tappable "Active Effects · N ›" row |
| `components/ActiveEffectsSheet.tsx` | **new** | Bottom sheet listing gear + artifacts sections |
| [components/index.ts](../../../components/index.ts) | modify | Re-export the two new components |
| [app/index.tsx](../../../app/index.tsx) | modify | Mount the button + sheet beneath `<StatBlock />` |

No test files — the project currently has no test harness set up. Verification is manual on the Expo dev server.

---

## Task 1: Add `shortEffect` to `ItemDefinition` and populate core artifacts

**Files:**
- Modify: [data/items.ts](../../../data/items.ts)

- [ ] **Step 1: Extend the `ItemDefinition` interface**

In [data/items.ts](../../../data/items.ts), change the interface (around lines 4-11) to:

```ts
interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  goldCost: number;
  pack?: QuestPack;
  shortEffect?: string;
}
```

- [ ] **Step 2: Populate `shortEffect` on the five non-equippable core artifacts**

Find each of these entries in `ITEM_DEFINITIONS` in [data/items.ts](../../../data/items.ts) and add a `shortEffect` property. Match the entry by `id`:

- `talisman-of-lore` → `shortEffect: '+1 Mind Point'`
- `wand-of-magic` → `shortEffect: 'Cast 2 different spells per turn'`
- `ring-of-return` → `shortEffect: 'Teleport all visible heroes to the stairway (one use)'`
- `spell-ring` → `shortEffect: 'Cast one spell twice per quest'`
- `ring-of-fortitude` → `shortEffect: '+1 Body Point'`

Do **not** add `shortEffect` to: `elixir-of-life`, `borins-armor`, `wizards-cloak`, or any potion/tool. (Equippable artifacts — Borin's Armor, Wizard's Cloak, and the artifact weapons — are handled by the gear row derived from their typed fields in [data/armor.ts](../../../data/armor.ts) / [data/weapons.ts](../../../data/weapons.ts).)

- [ ] **Step 3: Sanity-check TypeScript**

Run:

```bash
cd /Users/denisharda/Sites/ai-cowork/heroquest-herosheet
npx tsc --noEmit
```

Expected: no type errors (adding an optional field is backward-compatible).

- [ ] **Step 4: Commit**

```bash
git add data/items.ts
git commit -m "feat(items): add shortEffect field for active-effects panel

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Create pure `getActiveEffects` function

**Files:**
- Create: `lib/activeEffects.ts`

- [ ] **Step 1: Create the file with the full implementation**

Write the following to `lib/activeEffects.ts`:

```ts
import { Hero } from '@/types';
import { ITEM_DEFINITIONS } from '@/data/items';

export interface ActiveEffectRow {
  source: 'gear' | 'artifact';
  itemId: string;
  name: string;
  effect: string;
  isArtifact: boolean;
}

export interface ActiveEffects {
  gear: ActiveEffectRow[];
  artifacts: ActiveEffectRow[];
  totalCount: number;
}

const describeWeapon = (
  attackDice: number,
  diagonal: boolean,
  ranged: boolean | undefined,
): string => {
  const parts = [`${attackDice} Attack dice`];
  if (diagonal) parts.push('diagonal');
  if (ranged) parts.push('ranged');
  return parts.join(', ');
};

const describeArmor = (defendDice: number, movementPenalty: boolean | undefined): string => {
  const parts = [`+${defendDice} Defend dice`];
  if (movementPenalty) parts.push('reduces movement to 1d6');
  return parts.join(', ');
};

export const getActiveEffects = (hero: Hero): ActiveEffects => {
  const gear: ActiveEffectRow[] = [];
  const equippedArtifactIds = new Set<string>();

  const { weapon, shield, helmet, armor } = hero.equipment;

  if (weapon) {
    let effect = describeWeapon(weapon.attackDice, weapon.diagonalAttack, weapon.ranged);
    if (weapon.isArtifact && weapon.description) {
      effect = `${effect} — ${weapon.description}`;
    }
    gear.push({
      source: 'gear',
      itemId: weapon.id,
      name: weapon.name,
      effect,
      isArtifact: weapon.isArtifact === true,
    });
    if (weapon.isArtifact) equippedArtifactIds.add(weapon.id);
  }

  if (shield) {
    gear.push({
      source: 'gear',
      itemId: shield.id,
      name: shield.name,
      effect: `+${shield.defendDice} Defend dice`,
      isArtifact: false,
    });
  }

  if (helmet) {
    gear.push({
      source: 'gear',
      itemId: helmet.id,
      name: helmet.name,
      effect: `+${helmet.defendDice} Defend dice`,
      isArtifact: false,
    });
  }

  if (armor) {
    let effect = describeArmor(armor.defendDice, armor.movementPenalty);
    if (armor.isArtifact && armor.description) {
      effect = `${effect} — ${armor.description}`;
    }
    gear.push({
      source: 'gear',
      itemId: armor.id,
      name: armor.name,
      effect,
      isArtifact: armor.isArtifact === true,
    });
    if (armor.isArtifact) equippedArtifactIds.add(armor.id);
  }

  const artifacts: ActiveEffectRow[] = [];
  for (const item of hero.inventory) {
    if (item.category !== 'artifact') continue;
    if (equippedArtifactIds.has(item.id)) continue;

    const def = ITEM_DEFINITIONS.find((d) => d.id === item.id);
    const effect = def?.shortEffect ?? def?.description ?? item.description;

    artifacts.push({
      source: 'artifact',
      itemId: item.id,
      name: item.name,
      effect,
      isArtifact: true,
    });
  }

  return { gear, artifacts, totalCount: gear.length + artifacts.length };
};
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/denisharda/Sites/ai-cowork/heroquest-herosheet
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/activeEffects.ts
git commit -m "feat(lib): add getActiveEffects pure function

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Create `ActiveEffectsButton` component

**Files:**
- Create: `components/ActiveEffectsButton.tsx`

- [ ] **Step 1: Write the component**

Write the following to `components/ActiveEffectsButton.tsx`:

```tsx
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';

interface Props {
  count: number;
  onPress: () => void;
}

export const ActiveEffectsButton: React.FC<Props> = ({ count, onPress }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={styles.left}>
        <Ionicons name="sparkles" size={18} color={theme.colors.accent} />
        <Text style={[styles.label, { color: theme.colors.text }]}>Active Effects</Text>
        <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
          <Text style={[styles.badgeText, { color: theme.colors.textOnAccent }]}>{count}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/denisharda/Sites/ai-cowork/heroquest-herosheet
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ActiveEffectsButton.tsx
git commit -m "feat(ui): add ActiveEffectsButton row component

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Create `ActiveEffectsSheet` component

**Files:**
- Create: `components/ActiveEffectsSheet.tsx`

- [ ] **Step 1: Write the bottom-sheet component**

Write the following to `components/ActiveEffectsSheet.tsx`. The `ref` pattern and backdrop wiring mirror [components/HeroSwitcher.tsx](../../../components/HeroSwitcher.tsx) — follow it if you need precedent.

```tsx
import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme/ThemeContext';
import { ActiveEffectRow } from '@/lib/activeEffects';

interface Props {
  gear: ActiveEffectRow[];
  artifacts: ActiveEffectRow[];
}

export const ActiveEffectsSheet = forwardRef<BottomSheetModal, Props>(
  ({ gear, artifacts }, ref) => {
    const { theme } = useTheme();
    const snapPoints = useMemo(() => ['65%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const totalCount = gear.length + artifacts.length;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Active Effects</Text>

          {totalCount === 0 && (
            <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
              No active effects. Equip gear or collect artifacts to see them here.
            </Text>
          )}

          {gear.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
                Equipped Gear
              </Text>
              {gear.map((row) => (
                <EffectRowView key={`gear-${row.itemId}`} row={row} />
              ))}
            </View>
          )}

          {artifacts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
                Artifacts
              </Text>
              {artifacts.map((row) => (
                <EffectRowView key={`artifact-${row.itemId}`} row={row} />
              ))}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

ActiveEffectsSheet.displayName = 'ActiveEffectsSheet';

const EffectRowView: React.FC<{ row: ActiveEffectRow }> = ({ row }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.rowHeader}>
        <Text style={[styles.rowName, { color: theme.colors.text }]}>{row.name}</Text>
        {row.isArtifact && (
          <View style={[styles.artifactBadge, { backgroundColor: theme.colors.itemArtifact }]}>
            <Text style={[styles.artifactBadgeText, { color: theme.colors.textOnAccent }]}>
              Artifact
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.rowEffect, { color: theme.colors.textSecondary }]}>{row.effect}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  empty: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
  },
  artifactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  artifactBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  rowEffect: {
    fontSize: 13,
    lineHeight: 18,
  },
});
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/denisharda/Sites/ai-cowork/heroquest-herosheet
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ActiveEffectsSheet.tsx
git commit -m "feat(ui): add ActiveEffectsSheet bottom sheet

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Re-export the new components from the barrel

**Files:**
- Modify: [components/index.ts](../../../components/index.ts)

- [ ] **Step 1: Read the current barrel**

```bash
cat /Users/denisharda/Sites/ai-cowork/heroquest-herosheet/components/index.ts
```

- [ ] **Step 2: Append the new exports**

Add these two lines to the bottom of [components/index.ts](../../../components/index.ts):

```ts
export { ActiveEffectsButton } from './ActiveEffectsButton';
export { ActiveEffectsSheet } from './ActiveEffectsSheet';
```

- [ ] **Step 3: Commit**

```bash
git add components/index.ts
git commit -m "chore(components): export ActiveEffects components

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Wire the button + sheet into the hero screen

**Files:**
- Modify: [app/index.tsx](../../../app/index.tsx)

- [ ] **Step 1: Read the imports and the hero-sheet render tree**

```bash
grep -n "import\|<StatBlock\|useMemo\|useRef" /Users/denisharda/Sites/ai-cowork/heroquest-herosheet/app/index.tsx | head -50
```

- [ ] **Step 2: Add imports**

At the top of [app/index.tsx](../../../app/index.tsx), alongside the existing React imports, ensure `useMemo` and `useRef` are imported from `react`. Then add:

```ts
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useHero } from '@/hooks/useHero';
import { getActiveEffects } from '@/lib/activeEffects';
import { ActiveEffectsButton, ActiveEffectsSheet } from '@/components';
```

(If `useHero` is already imported in this file, don't duplicate it. `ActiveEffectsButton` and `ActiveEffectsSheet` can also be merged into an existing `'@/components'` import line if one exists.)

- [ ] **Step 3: Add state + derived values inside the screen component**

Inside the `HomeScreen` (or equivalently named top-level component in [app/index.tsx](../../../app/index.tsx)), add:

```ts
const { hero } = useHero();
const activeEffectsRef = useRef<BottomSheetModal>(null);

const activeEffects = useMemo(
  () => (hero ? getActiveEffects(hero) : { gear: [], artifacts: [], totalCount: 0 }),
  [hero?.equipment, hero?.inventory],
);

const openActiveEffects = () => activeEffectsRef.current?.present();
```

If `useHero` is already destructured earlier in the component, merge the field instead of duplicating the call.

- [ ] **Step 4: Render the button directly beneath `<StatBlock />`**

Find the line `<StatBlock />` (around line 261) and insert the button immediately after it:

```tsx
<StatBlock />
<ActiveEffectsButton count={activeEffects.totalCount} onPress={openActiveEffects} />
```

- [ ] **Step 5: Mount the sheet outside the `ScrollView`**

Find the closing of the main return (the root `<View>` just before the component's return ends). Mount the sheet as a sibling of the ScrollView so it renders above it. Place this as the last child of the root view, after the existing `{/* Bottom Actions */}` block:

```tsx
<ActiveEffectsSheet
  ref={activeEffectsRef}
  gear={activeEffects.gear}
  artifacts={activeEffects.artifacts}
/>
```

- [ ] **Step 6: Type-check**

```bash
cd /Users/denisharda/Sites/ai-cowork/heroquest-herosheet
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/index.tsx
git commit -m "feat(hero-screen): mount Active Effects button and sheet

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Manual verification on device/simulator

**Files:** none (runtime verification).

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/denisharda/Sites/ai-cowork/heroquest-herosheet
npx expo start
```

Scan the QR code (iOS/Android Expo Go or a dev build), or press `i` / `a` for a simulator.

- [ ] **Step 2: Verify the empty state**

Create a new hero or select one with no equipment and no inventory.
- **Expected:** the "Active Effects · 0 ›" row appears beneath the stat block. Tapping it opens a sheet with "No active effects. Equip gear or collect artifacts to see them here."

- [ ] **Step 3: Verify Equipped Gear section**

Equip a shortsword and a shield.
- **Expected:** the row shows `Active Effects · 2`. Opening the sheet shows an "Equipped Gear" section with `Shortsword — 2 Attack dice` and `<shield name> — +N Defend dice`. No "Artifacts" section.

- [ ] **Step 4: Verify Artifacts section with a pure passive**

Add "Talisman of Lore" to the hero's inventory (via the armory or inventory UI).
- **Expected:** the "Artifacts" section shows `Talisman of Lore — +1 Mind Point`. The hero's stat block's Mind breakdown already reflects the +1 (sanity check that the panel matches the existing stats logic).

- [ ] **Step 5: Verify an equippable artifact is not duplicated**

Equip Borin's Armor (add via armory if not present, then equip).
- **Expected:** Borin's Armor appears under "Equipped Gear" with the full effect text (`+4 Defend dice` + description text including "does not slow down its wearer") and an "Artifact" badge. It does **NOT** appear under "Artifacts" even though it's in inventory.

- [ ] **Step 6: Verify an artifact weapon**

Equip "Orc's Bane" (add via armory then equip).
- **Expected:** under "Equipped Gear", the weapon shows `Orc's Bane — 2 Attack dice — <description>` with the "Artifact" badge. It does not appear under "Artifacts".

- [ ] **Step 7: Verify counts and sections update live**

Unequip the armor. The sheet should immediately reflect the change on next open: Borin's Armor now appears under "Artifacts" (because it's still in inventory), with its `description` falling back through the artifact lookup. Count drops/rises accordingly.

- [ ] **Step 8: Report results**

Summarize what was tested and any deviations from expected behavior. If a step failed, stop and triage before committing any follow-up fixes.

---

## Task 8: Final integration commit (if any follow-up fixes were needed)

**Files:** whatever was touched during verification.

- [ ] **Step 1: If Task 7 surfaced bugs, fix them minimally and commit**

One small commit per fix, referencing the verification step that caught it. If Task 7 passed cleanly, skip this task.

- [ ] **Step 2: Final type-check and sanity run**

```bash
cd /Users/denisharda/Sites/ai-cowork/heroquest-herosheet
npx tsc --noEmit
```

Expected: no errors.
