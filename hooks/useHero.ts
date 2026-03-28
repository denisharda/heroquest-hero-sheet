import { useMemo } from 'react';
import { useHeroStore } from '@/store/heroStore';
import { HERO_CLASSES } from '@/data/heroes';
import { ARTIFACT_EFFECTS } from '@/data/items';
import { ComputedStats, Hero } from '@/types';

export const useHero = () => {
  const store = useHeroStore();
  const hero = store.getCurrentHero();

  const computedStats = useMemo((): ComputedStats | null => {
    if (!hero) return null;

    const classStats = HERO_CLASSES[hero.heroClass];
    const { equipment } = hero;

    // Calculate attack - weapon REPLACES base attack, doesn't add to it
    // Unarmed = 1 attack die (minimum per rulebook)
    const weaponAttack = equipment.weapon?.attackDice ?? 0;
    const totalAttack = equipment.weapon ? weaponAttack : 1;

    // Build attack breakdown
    const attackBreakdown = equipment.weapon
      ? `${weaponAttack} (${equipment.weapon.name})`
      : '1 (unarmed)';

    // Calculate defense
    const baseDefend = classStats.baseDefend;
    const shieldDefend = equipment.shield?.defendDice ?? 0;
    const helmetDefend = equipment.helmet?.defendDice ?? 0;
    const armorDefend = equipment.armor?.defendDice ?? 0;

    // Scan inventory for artifact stat effects
    let artifactBodyBonus = 0;
    let artifactDefendBonus = 0;
    let artifactMindBonus = 0;
    let hasArmorOverride = false;
    let armorOverrideValue = 0;
    let artifactNegatesMovePenalty = false;
    const artifactBodyParts: string[] = [];
    const artifactDefendParts: string[] = [];
    const artifactMindParts: string[] = [];

    for (const item of hero.inventory) {
      if (item.category !== 'artifact') continue;
      const effect = ARTIFACT_EFFECTS[item.id];
      if (!effect) continue;
      if (effect.allowedClasses && !effect.allowedClasses.includes(hero.heroClass)) continue;

      if (effect.bonusBodyPoints) {
        artifactBodyBonus += effect.bonusBodyPoints;
        artifactBodyParts.push(`${effect.bonusBodyPoints} (${item.name})`);
      }
      if (effect.bonusMindPoints) {
        artifactMindBonus += effect.bonusMindPoints;
        artifactMindParts.push(`${effect.bonusMindPoints} (${item.name})`);
      }
      if (effect.bonusDefendDice) {
        artifactDefendBonus += effect.bonusDefendDice;
        artifactDefendParts.push(`${effect.bonusDefendDice} (${item.name})`);
      }
      if (effect.overrideArmorDefend !== undefined) {
        hasArmorOverride = true;
        armorOverrideValue = effect.overrideArmorDefend;
      }
      if (effect.negatesMovementPenalty) {
        artifactNegatesMovePenalty = true;
      }
    }

    // Build defense with artifact effects
    const defendParts: string[] = [`${baseDefend} (base)`];
    let totalDefend: number;

    if (hasArmorOverride) {
      // Borin's Armor: "roll four combat dice in defense" = 4 total base defense
      // This replaces base + armor, but shield/helmet still stack
      const borinsContribution = armorOverrideValue - baseDefend;
      defendParts.push(`${borinsContribution} (Borin's Armor)`);
      if (equipment.shield) defendParts.push(`${shieldDefend} (${equipment.shield.name})`);
      if (equipment.helmet) defendParts.push(`${helmetDefend} (${equipment.helmet.name})`);
      totalDefend = armorOverrideValue + shieldDefend + helmetDefend + artifactDefendBonus;
    } else {
      if (equipment.shield) defendParts.push(`${shieldDefend} (${equipment.shield.name})`);
      if (equipment.helmet) defendParts.push(`${helmetDefend} (${equipment.helmet.name})`);
      if (equipment.armor) defendParts.push(`${armorDefend} (${equipment.armor.name})`);
      totalDefend = baseDefend + shieldDefend + helmetDefend + armorDefend + artifactDefendBonus;
    }
    for (const part of artifactDefendParts) {
      defendParts.push(part);
    }
    const defendBreakdown = defendParts.join(' + ');

    // Calculate movement dice (Plate Mail reduces to 1d6, but Borin's Armor negates penalty)
    const moveDice = (equipment.armor?.movementPenalty && !artifactNegatesMovePenalty)
      ? 1
      : classStats.baseMove;

    // Movement breakdown
    let moveBreakdown: string | undefined;
    if (equipment.armor?.movementPenalty && !artifactNegatesMovePenalty) {
      moveBreakdown = 'Plate Mail';
    } else if (equipment.armor?.movementPenalty && artifactNegatesMovePenalty) {
      moveBreakdown = "Borin's Armor negates penalty";
    }

    // Body points with artifact bonus
    const maxBodyPoints = classStats.bodyPoints + artifactBodyBonus;
    const bodyBreakdown = artifactBodyParts.length > 0
      ? `${classStats.bodyPoints} (base) + ${artifactBodyParts.join(' + ')}`
      : undefined;

    // Mind points with artifact bonus
    const maxMindPoints = classStats.mindPoints + artifactMindBonus;
    const mindBreakdown = artifactMindParts.length > 0
      ? `${classStats.mindPoints} (base) + ${artifactMindParts.join(' + ')}`
      : undefined;

    return {
      totalAttack,
      totalDefend,
      moveDice,
      maxBodyPoints,
      maxMindPoints,
      attackBreakdown,
      defendBreakdown,
      moveBreakdown,
      bodyBreakdown,
      mindBreakdown,
    };
  }, [hero]);

  return {
    hero,
    computedStats,
    ...store,
  };
};

export const useHeroList = () => {
  const heroes = useHeroStore((state) => state.heroes);
  const currentHeroId = useHeroStore((state) => state.currentHeroId);
  const selectHero = useHeroStore((state) => state.selectHero);
  const createHero = useHeroStore((state) => state.createHero);
  const deleteHero = useHeroStore((state) => state.deleteHero);

  return {
    heroes,
    currentHeroId,
    selectHero,
    createHero,
    deleteHero,
  };
};
