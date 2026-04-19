# Active Effects Panel — Design

**Status:** Draft
**Date:** 2026-04-19
**Scope:** One feature on the hero sheet. No data migration, no rules-engine work beyond what already exists.

## Goal

Give the player one place to see every modifier currently affecting their hero from equipped gear and owned artifacts. Today those modifiers are spread across the stat breakdowns (`attackBreakdown`, `defendBreakdown` in `ComputedStats`) and the raw `description` strings on artifacts in the inventory — there is no single view that lists all of them side-by-side.

## Non-Goals

- Building a rules engine that applies conditional effects automatically ("2 dice vs orcs", "immune to fire"). The app continues to show the rule; the player continues to apply it at the table.
- Adding structured `effects: []` arrays on items. The existing `ARTIFACT_EFFECTS` map + the new `shortEffect` string field are enough for this feature.
- Tracking temporary/consumable effects (potions mid-use, Heroic Brew, Potion of Strength). Those are in-the-moment actions, not persistent hero state.
- Filtering for class restrictions inside the panel. If a Barbarian has a Wizard's Cloak in their inventory, it simply isn't equipped (class restrictions are already enforced at equip time), so the panel won't list it as an active effect.

## User-Facing Behavior

On the hero sheet, beneath the stat block, a compact row reads:

> **Active Effects · N** ›

where `N` is the count of active modifiers. Tapping the row opens a bottom sheet.

The bottom sheet lists active effects grouped by source in this order:

1. **Equipped Gear** — one row per non-null slot of `hero.equipment` (weapon, shield, helmet, armor). Each row shows the item name + a short derived effect string (e.g. "Shortsword — +2 Attack dice", "Borin's Armor — +4 Defend dice, ignores movement penalty").
2. **Artifacts** — one row per item in `hero.inventory` with `category === 'artifact'` **that is not already represented as equipped gear**. Each row shows the name + `shortEffect` when present, falling back to the first ~100 chars of `description` when not.

Each section shows a header. If a section has zero rows, the section is omitted entirely. If there are zero effects total, the panel shows a neutral empty state ("No active effects.") — the row that opens it still appears, just with `N = 0`.

The row itself is tappable; there is no separate button/icon. On very dense screens this avoids adding yet another icon to the header.

## Data Changes

### 1. `ItemDefinition` in [data/items.ts](../../../data/items.ts)

Add an optional field:

```ts
interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  goldCost: number;
  pack?: QuestPack;
  shortEffect?: string; // short active-effect label; artifacts only
}
```

Populate `shortEffect` for these **non-equippable** artifacts (they live only in `inventory`):

| id | shortEffect |
|---|---|
| `talisman-of-lore` | `+1 Mind Point` |
| `wand-of-magic` | `Cast 2 different spells per turn` |
| `ring-of-return` | `Teleport all visible heroes to the stairway (one use)` |
| `spell-ring` | `Cast one spell twice per quest` |
| `ring-of-fortitude` | `+1 Body Point` |

**Equippable artifacts (handled via the gear row, not the artifacts row):**
- Armor: `borins-armor`, `wizards-cloak` (in [data/armor.ts](../../../data/armor.ts) with `isArtifact: true`).
- Weapons: `orcs-bane`, `wizards-staff`, `spirit-blade`, `fortunes-longsword`, `phantom-blade` (in [data/weapons.ts](../../../data/weapons.ts) with `isArtifact: true`). The equippable-weapon artifacts from expansion packs (`fortunes-longsword`, `phantom-blade`) are picked up automatically when equipped.

**Explicitly excluded from `shortEffect`:**
- `elixir-of-life` — one-use consumable; not an ongoing modifier.
- `potion-of-*`, `heroic-brew`, `healing-potion`, `toolkit` — not artifacts.

### 2. No other data-shape changes

- `ArtifactEffect` and `ARTIFACT_EFFECTS` stay as-is — they're the mechanism for the passive numeric bonuses (`Talisman of Lore`, `Ring of Fortitude`) consumed by `useHero.computedStats`. The panel does not duplicate their logic; it just *shows* that those artifacts are active.
- `Hero`, `Equipment`, `Item` types are unchanged.

## Code Structure

Three small units, each with one clear purpose:

### Unit 1: `getActiveEffects(hero)` — pure function, new file

Location: `lib/activeEffects.ts` (new file — colocated with other derived logic; `lib/` already holds Supabase/util code).

Signature:

```ts
export interface ActiveEffectRow {
  source: 'gear' | 'artifact';
  name: string;
  effect: string;
  itemId: string; // key for rendering
}

export function getActiveEffects(hero: Hero): {
  gear: ActiveEffectRow[];
  artifacts: ActiveEffectRow[];
  totalCount: number;
}
```

Implementation:
- **Gear rows:** for each non-null slot in `hero.equipment`, build a row. The `effect` string is derived from the slot's typed fields:
  - Weapon: `` `${w.attackDice} Attack dice${w.diagonalAttack ? ', diagonal' : ''}${w.ranged ? ', ranged' : ''}` ``. If `w.isArtifact === true`, append the weapon's `description` (full rule text, e.g. "attack twice vs Orcs") separated by " — ".
  - Shield/Helmet: `` `+${s.defendDice} Defend dice` ``.
  - Armor: `` `+${a.defendDice} Defend dice${a.movementPenalty ? ', reduces movement to 1d6' : ''}` ``. If `a.isArtifact === true`, append the armor's `description`.
  - For equippable artifacts (`isArtifact === true`), mark the row `source: 'gear'` but visually flag it (e.g. a small "Artifact" badge). That's a presentation detail handled in `ActiveEffectsSheet`, not in `getActiveEffects`.
- **Artifact rows:** filter `hero.inventory` for `category === 'artifact'` AND **exclude any id that is currently represented in the gear rows** (covers `borins-armor`, `wizards-cloak`, `orcs-bane`, `wizards-staff`, `spirit-blade`, `fortunes-longsword`, `phantom-blade` when equipped). For each remaining artifact:
  - Look up its `ItemDefinition` by id to get `shortEffect`.
  - If `shortEffect` is present, use it.
  - Otherwise, use `description` (unchanged from today).
- Return `{ gear, artifacts, totalCount: gear.length + artifacts.length }`.

Pure function — trivially unit-testable if you ever add tests.

### Unit 2: `ActiveEffectsButton` — compact tappable row

Location: `components/ActiveEffectsButton.tsx`.

- Receives `count: number` and `onPress: () => void`.
- Renders a single row styled to match the existing stat-adjacent UI (themed surface, border, chevron `›` on the right).
- Rendered directly beneath the existing `StatBlock` in the main hero screen — `StatBlock` is not modified.

### Unit 3: `ActiveEffectsSheet` — bottom sheet

Location: `components/ActiveEffectsSheet.tsx`.

- Built on `@gorhom/bottom-sheet` (already used elsewhere in the app — follow the existing pattern; check `BottomSheetModalProvider` is already mounted at the root layout).
- Opens to ~65% of screen height; content scrollable with `BottomSheetScrollView`.
- Receives `gear: ActiveEffectRow[]`, `artifacts: ActiveEffectRow[]`, `isVisible`, `onClose`.
- Renders two sections with headers "Equipped Gear" and "Artifacts". Sections with zero rows are omitted. Zero total rows → empty state text.
- Each row is a simple two-line list item: bold name, muted effect text.

### Wiring

In the hero screen (likely `app/index.tsx` or wherever `StatBlock` is rendered):

- Call `getActiveEffects(hero)` once per render (or `useMemo`-gated on `hero.equipment` and `hero.inventory`).
- Render `<ActiveEffectsButton count={totalCount} onPress={openSheet} />` beneath the stat block.
- Render `<ActiveEffectsSheet gear={gear} artifacts={artifacts} isVisible={...} onClose={...} />` alongside it.

The state (`isVisible`) can be a simple `useState` in the parent component.

## Error Handling

Nothing network-bound or async. The only thing that can go "wrong" is a hero having items in inventory whose ids aren't in `ITEM_DEFINITIONS` (stale data from Supabase after a schema change, for instance). In that case the artifact row falls back to `inventory[i].name` + `inventory[i].description` — both fields exist on `Item`, so we never crash.

## Testing

- Manual smoke test on the Expo dev server covering:
  1. Hero with no equipment and no artifacts → panel shows empty state, count = 0.
  2. Hero with only equipped weapon/shield → only "Equipped Gear" section, correct derived effect text.
  3. Hero with only owned artifacts → only "Artifacts" section.
  4. Hero with Borin's Armor *equipped* → appears under "Equipped Gear" (with "ignores movement penalty"), **not** duplicated under "Artifacts".
  5. Hero with Talisman of Lore in inventory → "+1 Mind Point" shown, and stat block's `mindBreakdown` already reflects the +1 (sanity check that the panel matches reality).

No automated tests added in this cycle (the project currently has none).

## Risks & Tradeoffs

- **`shortEffect` drift from `description`.** The panel shows a terse version while the inventory detail screen shows the full rule. If one is edited and the other isn't, they disagree. Mitigated by keeping `shortEffect` values short and factual (drawn from the existing `description`), and by treating `description` as the source of truth when `shortEffect` is absent.
- **Special-casing Borin's Armor** in `getActiveEffects`. Minor code smell but the alternative — looking up the armor's id in `ARTIFACT_EFFECTS` and reading `negatesMovementPenalty` — is no cleaner and introduces a data dependency. Acceptable for one known item.
- **No generic handling of class restrictions in the panel.** Accepted: equip-time enforcement keeps impossible combinations out of the equipment slots, and artifacts kept in inventory aren't shown as "active" unless they're truly passive. The panel is a view layer; it doesn't need to re-validate game rules.
