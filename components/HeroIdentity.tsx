import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { PURE_COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { useHero } from '@/hooks/useHero';
import { PlaceholderPortrait } from './PlaceholderPortrait';
import { HERO_CLASSES } from '@/data/heroes';
import { HeroClassName } from '@/types';
import { withOpacity } from '@/theme/colorUtils';
import { getClassColor } from '@/theme/colorHelpers';

export const HeroIdentity: React.FC = () => {
  const { theme } = useTheme();
  const { hero, updateHeroName } = useHero();

  if (!hero) return null;

  const classData = HERO_CLASSES[hero.heroClass];

  const handleNameChange = (text: string) => {
    updateHeroName(text);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <PlaceholderPortrait heroClass={hero.heroClass} size={80} />

      <View style={styles.inputsContainer}>
        <View style={styles.inputRow}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Name
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            value={hero.name}
            onChangeText={handleNameChange}
            placeholder="Enter hero name"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Class
          </Text>
          <View
            style={[
              styles.classDisplay,
              {
                backgroundColor: withOpacity(getClassColor(classData.name, theme.colors), 0.13),
                borderColor: getClassColor(classData.name, theme.colors),
              },
            ]}
          >
            <View
              style={[
                styles.classIcon,
                { backgroundColor: getClassColor(classData.name, theme.colors) },
              ]}
            >
              <Text style={styles.classIconText}>
                {classData.portraitInitial}
              </Text>
            </View>
            <Text style={[styles.classDisplayText, { color: theme.colors.text }]}>
              {hero.heroClass}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: SPACING.section,
  },
  inputsContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  inputRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Cinzel_600SemiBold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  textInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Cinzel_500Medium',
  },
  classDisplay: {
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classIconText: {
    color: PURE_COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  classDisplayText: {
    fontSize: 16,
    fontFamily: 'Cinzel_600SemiBold',
    marginLeft: 8,
  },
});
