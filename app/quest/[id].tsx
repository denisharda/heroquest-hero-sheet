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
import { getQuestById } from '@/data/quests';
import * as Haptics from 'expo-haptics';

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { hero, toggleQuestCompleted } = useHero();
  const insets = useSafeAreaInsets();

  const questId = parseInt(id || '1', 10);
  const quest = getQuestById(questId);
  const isCompleted = hero?.questsCompleted.includes(questId) || false;

  if (!quest) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Quest not found
        </Text>
      </View>
    );
  }

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleToggleComplete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleQuestCompleted(questId);
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
          Quest {questId}
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
        {/* Quest Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: isCompleted ? theme.colors.success : theme.colors.accent,
            },
          ]}
        >
          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isCompleted
                  ? theme.colors.success
                  : theme.colors.accent,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={isCompleted ? 'check-circle' : 'sword-cross'}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.statusBadgeText}>
              {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
            </Text>
          </View>

          {/* Quest Name */}
          <Text style={[styles.questName, { color: theme.colors.text }]}>
            {quest.name}
          </Text>

          {/* Quest Number */}
          <View style={[styles.questNumberBox, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.questNumberLabel, { color: theme.colors.textSecondary }]}>
              QUEST
            </Text>
            <Text style={[styles.questNumber, { color: theme.colors.accent }]}>
              {questId}
            </Text>
            <Text style={[styles.questNumberLabel, { color: theme.colors.textSecondary }]}>
              OF 14
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          {/* Description */}
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
            DESCRIPTION
          </Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {quest.description}
          </Text>
        </View>

        {/* Toggle Complete Button */}
        <Pressable
          style={[
            styles.toggleButton,
            {
              backgroundColor: isCompleted
                ? theme.colors.danger + '20'
                : theme.colors.success + '20',
              borderColor: isCompleted
                ? theme.colors.danger
                : theme.colors.success,
            },
          ]}
          onPress={handleToggleComplete}
        >
          <MaterialCommunityIcons
            name={isCompleted ? 'close-circle-outline' : 'check-circle-outline'}
            size={24}
            color={isCompleted ? theme.colors.danger : theme.colors.success}
          />
          <Text
            style={[
              styles.toggleButtonText,
              { color: isCompleted ? theme.colors.danger : theme.colors.success },
            ]}
          >
            {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
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
    fontFamily: 'Cinzel_700Bold',
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  questName: {
    fontSize: 24,
    fontFamily: 'Cinzel_700Bold',
    marginBottom: 16,
  },
  questNumberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  questNumberLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  questNumber: {
    fontSize: 32,
    fontFamily: 'Cinzel_700Bold',
  },
  divider: {
    height: 2,
    marginVertical: 16,
    borderRadius: 1,
  },
  sectionLabel: {
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
