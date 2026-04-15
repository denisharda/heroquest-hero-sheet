import { ThemeColors, HeroClassName, SpellSchool, ItemCategory } from '@/types';

export const getClassColor = (className: HeroClassName, colors: ThemeColors): string => {
  const map: Record<HeroClassName, string> = {
    Barbarian: colors.classBarbarian,
    Dwarf: colors.classDwarf,
    Elf: colors.classElf,
    Wizard: colors.classWizard,
  };
  return map[className];
};

export const getSchoolColor = (school: SpellSchool, colors: ThemeColors): string => {
  const map: Record<SpellSchool, string> = {
    Fire: colors.spellFire,
    Water: colors.spellWater,
    Earth: colors.spellEarth,
    Air: colors.spellAir,
  };
  return map[school];
};

export const getCategoryColor = (category: ItemCategory, colors: ThemeColors): string => {
  const map: Record<ItemCategory, string> = {
    potion: colors.itemPotion,
    tool: colors.itemTool,
    artifact: colors.itemArtifact,
    misc: colors.itemMisc,
  };
  return map[category];
};
