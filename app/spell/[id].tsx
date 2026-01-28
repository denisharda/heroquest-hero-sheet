import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { SPELL_SCHOOL_COLORS } from '@/constants/colors';
import { SpellSchool } from '@/types';
import * as Haptics from 'expo-haptics';

const SCHOOL_ICONS: Record<SpellSchool, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Air: 'weather-windy',
  Earth: 'terrain',
  Fire: 'fire',
  Water: 'water',
};

export default function SpellDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { hero, toggleSpellUsed } = useHero();
  const insets = useSafeAreaInsets();

  const spell = hero?.spells.find((s) => s.id === id);

  if (!spell) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Spell not found
        </Text>
      </View>
    );
  }

  const schoolColor = SPELL_SCHOOL_COLORS[spell.school];
  const schoolIcon = SCHOOL_ICONS[spell.school];

  const handleToggleUsed = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSpellUsed(spell.id);
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleBack}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Spell Card
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Spell Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: schoolColor,
              opacity: spell.used ? 0.7 : 1,
            },
          ]}
        >
          {/* School Badge */}
          <View style={[styles.schoolBadge, { backgroundColor: schoolColor }]}>
            <MaterialCommunityIcons
              name={schoolIcon}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.schoolBadgeText}>{spell.school}</Text>
          </View>

          {/* Spell Name */}
          <Text
            style={[
              styles.spellName,
              {
                color: theme.colors.text,
                textDecorationLine: spell.used ? 'line-through' : 'none',
              },
            ]}
          >
            {spell.name}
          </Text>

          {/* Used Status */}
          {spell.used && (
            <View style={[styles.usedBadge, { backgroundColor: theme.colors.danger + '30' }]}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={theme.colors.danger}
              />
              <Text style={[styles.usedBadgeText, { color: theme.colors.danger }]}>
                Already Cast This Quest
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: schoolColor + '40' }]} />

          {/* Description */}
          <Text style={[styles.descriptionLabel, { color: theme.colors.textSecondary }]}>
            EFFECT
          </Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {spell.description}
          </Text>

          {/* Rules Reminder */}
          <View style={[styles.rulesBox, { backgroundColor: theme.colors.background }]}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18}
              color={theme.colors.textSecondary}
            />
            <Text style={[styles.rulesText, { color: theme.colors.textSecondary }]}>
              Each spell can only be cast once per quest. Requires line of sight to target.
            </Text>
          </View>
        </View>

        {/* Toggle Button */}
        <Pressable
          style={[
            styles.toggleButton,
            {
              backgroundColor: spell.used
                ? theme.colors.success + '20'
                : theme.colors.danger + '20',
              borderColor: spell.used ? theme.colors.success : theme.colors.danger,
            },
          ]}
          onPress={handleToggleUsed}
        >
          <MaterialCommunityIcons
            name={spell.used ? 'refresh' : 'check'}
            size={24}
            color={spell.used ? theme.colors.success : theme.colors.danger}
          />
          <Text
            style={[
              styles.toggleButtonText,
              { color: spell.used ? theme.colors.success : theme.colors.danger },
            ]}
          >
            {spell.used ? 'Mark as Available' : 'Mark as Cast'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  card: {
    borderRadius: 16,
    borderWidth: 3,
    padding: 20,
    marginBottom: 20,
  },
  schoolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  schoolBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  spellName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  usedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  usedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  divider: {
    height: 2,
    marginVertical: 16,
    borderRadius: 1,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  rulesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  rulesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 10,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
