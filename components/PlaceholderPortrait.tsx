import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeroClassName, ThemeColors } from '@/types';
import { HERO_CLASSES } from '@/data/heroes';
import { useTheme } from '@/theme/ThemeContext';

const getClassColor = (className: HeroClassName, colors: ThemeColors): string => {
  const map: Record<HeroClassName, string> = {
    Barbarian: colors.classBarbarian,
    Dwarf: colors.classDwarf,
    Elf: colors.classElf,
    Wizard: colors.classWizard,
  };
  return map[className];
};

interface PlaceholderPortraitProps {
  heroClass: HeroClassName;
  size?: number;
}

export const PlaceholderPortrait: React.FC<PlaceholderPortraitProps> = ({
  heroClass,
  size = 80,
}) => {
  const { theme } = useTheme();
  const classData = HERO_CLASSES[heroClass];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: getClassColor(classData.name, theme.colors),
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.initial,
          {
            fontSize: size * 0.5,
            color: theme.colors.textOnAccent,
          },
        ]}
      >
        {classData.portraitInitial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  initial: {
    fontWeight: 'bold',
  },
});
