import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { SPELL_SCHOOL_COLORS } from '@/constants/colors';
import { getSpellsBySchool, SPELL_SCHOOLS } from '@/data/spells';
import { SpellSchool, Spell } from '@/types';
import * as Haptics from 'expo-haptics';

interface SpellItemProps {
  spell: Spell;
  onToggle: () => void;
  onPress: () => void;
}

const SpellItem: React.FC<SpellItemProps> = ({ spell, onToggle, onPress }) => {
  const { theme } = useTheme();
  const schoolColor = SPELL_SCHOOL_COLORS[spell.school];

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleCheckboxPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  };

  return (
    <Pressable
      style={[
        styles.spellItem,
        {
          backgroundColor: spell.used
            ? theme.colors.surfaceVariant
            : theme.colors.surface,
          borderColor: schoolColor,
          opacity: spell.used ? 0.6 : 1,
        },
      ]}
      onPress={handlePress}
    >
      <Pressable onPress={handleCheckboxPress} hitSlop={8}>
        <MaterialCommunityIcons
          name={spell.used ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={20}
          color={spell.used ? theme.colors.textSecondary : schoolColor}
        />
      </Pressable>
      <Text
        style={[
          styles.spellName,
          {
            color: spell.used ? theme.colors.textSecondary : theme.colors.text,
            textDecorationLine: spell.used ? 'line-through' : 'none',
          },
        ]}
      >
        {spell.name}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={16}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
};

interface SpellSchoolSectionProps {
  school: SpellSchool;
  spells: Spell[];
  onToggle: (spellId: string) => void;
  onSpellPress: (spellId: string) => void;
}

const SpellSchoolSection: React.FC<SpellSchoolSectionProps> = ({
  school,
  spells,
  onToggle,
  onSpellPress,
}) => {
  const { theme } = useTheme();
  const schoolColor = SPELL_SCHOOL_COLORS[school];

  if (spells.length === 0) return null;

  const getSchoolIcon = (): string => {
    switch (school) {
      case 'Fire':
        return 'fire';
      case 'Water':
        return 'water';
      case 'Earth':
        return 'terrain';
      case 'Air':
        return 'weather-windy';
      default:
        return 'star';
    }
  };

  return (
    <View style={styles.schoolSection}>
      <View style={styles.schoolHeader}>
        <MaterialCommunityIcons
          name={getSchoolIcon() as any}
          size={18}
          color={schoolColor}
        />
        <Text style={[styles.schoolName, { color: schoolColor }]}>{school}</Text>
      </View>
      <View style={styles.spellsList}>
        {spells.map((spell) => (
          <SpellItem
            key={spell.id}
            spell={spell}
            onToggle={() => onToggle(spell.id)}
            onPress={() => onSpellPress(spell.id)}
          />
        ))}
      </View>
    </View>
  );
};

export const SpellTracker: React.FC = () => {
  const { theme } = useTheme();
  const { hero, toggleSpellUsed, resetAllSpells } = useHero();
  const router = useRouter();

  if (!hero || hero.spells.length === 0) return null;

  const usedCount = hero.spells.filter((s) => s.used).length;
  const totalCount = hero.spells.length;

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetAllSpells();
  };

  const handleSpellPress = (spellId: string) => {
    router.push(`/spell/${spellId}`);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          SPELLS
        </Text>
        <View style={styles.headerRight}>
          <Text style={[styles.counter, { color: theme.colors.textSecondary }]}>
            {usedCount}/{totalCount} used
          </Text>
          {usedCount > 0 && (
            <Pressable
              style={[
                styles.resetButton,
                { backgroundColor: theme.colors.accent + '30' },
              ]}
              onPress={handleReset}
            >
              <Text style={[styles.resetText, { color: theme.colors.accent }]}>
                Reset
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {SPELL_SCHOOLS.map((school) => {
        const schoolSpells = getSpellsBySchool(hero.spells, school);
        return (
          <SpellSchoolSection
            key={school}
            school={school}
            spells={schoolSpells}
            onToggle={toggleSpellUsed}
            onSpellPress={handleSpellPress}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counter: {
    fontSize: 12,
  },
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  schoolSection: {
    marginBottom: 12,
  },
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  schoolName: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  spellsList: {
    gap: 6,
  },
  spellItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  spellName: {
    flex: 1,
    fontSize: 13,
    marginLeft: 6,
  },
});
