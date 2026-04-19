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
