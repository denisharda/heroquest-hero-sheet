import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeroClassName } from '@/types';
import { HERO_CLASSES } from '@/data/heroes';
import { useTheme } from '@/theme/ThemeContext';

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
          backgroundColor: classData.portraitColor,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.initial,
          {
            fontSize: size * 0.5,
            color: '#FFFFFF',
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
