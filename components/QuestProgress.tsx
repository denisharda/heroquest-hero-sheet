import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { QUESTS } from '@/data/quests';
import * as Haptics from 'expo-haptics';

const TOTAL_QUESTS = 14;

export const QuestProgress: React.FC = () => {
  const { theme } = useTheme();
  const { hero, toggleQuestCompleted } = useHero();
  const router = useRouter();

  if (!hero) return null;

  const completedCount = hero.questsCompleted.length;
  const progressPercent = Math.round((completedCount / TOTAL_QUESTS) * 100);

  const handleToggle = async (questNumber: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleQuestCompleted(questNumber);
  };

  const handleLongPress = async (questNumber: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/quest/${questNumber}` as any);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          QUESTS COMPLETED
        </Text>
        <Text style={[styles.progress, { color: theme.colors.accent }]}>
          {completedCount}/{TOTAL_QUESTS} ({progressPercent}%)
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.colors.accent,
              width: `${progressPercent}%`,
            },
          ]}
        />
      </View>

      <View style={styles.badgesContainer}>
        {QUESTS.map((quest) => {
          const isCompleted = hero.questsCompleted.includes(quest.id);
          return (
            <Pressable
              key={quest.id}
              style={[
                styles.badge,
                {
                  backgroundColor: isCompleted
                    ? theme.colors.accent
                    : theme.colors.surfaceVariant,
                  borderColor: isCompleted
                    ? theme.colors.accent
                    : theme.colors.border,
                },
              ]}
              onPress={() => handleToggle(quest.id)}
              onLongPress={() => handleLongPress(quest.id)}
              delayLongPress={300}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: isCompleted
                      ? '#FFFFFF'
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {quest.id}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        Tap to toggle completion • Long press for details
      </Text>
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
  progress: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
