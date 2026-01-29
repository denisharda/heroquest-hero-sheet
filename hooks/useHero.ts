import { useMemo } from 'react';
import { useHeroStore } from '@/store/heroStore';
import { HERO_CLASSES } from '@/data/heroes';
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
    const totalDefend = baseDefend + shieldDefend + helmetDefend + armorDefend;

    // Build defense breakdown
    const defendParts: string[] = [`${baseDefend} (base)`];
    if (equipment.shield) {
      defendParts.push(`${shieldDefend} (${equipment.shield.name})`);
    }
    if (equipment.helmet) {
      defendParts.push(`${helmetDefend} (${equipment.helmet.name})`);
    }
    if (equipment.armor) {
      defendParts.push(`${armorDefend} (${equipment.armor.name})`);
    }
    const defendBreakdown = defendParts.join(' + ');

    // Calculate movement dice (Plate Mail reduces to 1d6)
    const moveDice = equipment.armor?.movementPenalty ? 1 : classStats.baseMove;

    return {
      totalAttack,
      totalDefend,
      moveDice,
      maxBodyPoints: classStats.bodyPoints,
      maxMindPoints: classStats.mindPoints,
      attackBreakdown,
      defendBreakdown,
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
