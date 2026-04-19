import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { SPACING } from '@/constants/spacing';

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  breakdown?: string;
  color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ icon, label, value, breakdown, color }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {breakdown && (
        <Text
          style={[styles.statBreakdown, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {breakdown}
        </Text>
      )}
    </View>
  );
};

export const StatBlock: React.FC = () => {
  const { theme } = useTheme();
  const { hero, computedStats } = useHero();

  if (!hero || !computedStats) return null;

  return (
    <View style={styles.container}>
      <StatBox
        icon={
          <MaterialCommunityIcons
            name="sword-cross"
            size={20}
            color={theme.colors.attack}
          />
        }
        label="ATTACK"
        value={computedStats.totalAttack}
        breakdown={computedStats.attackBreakdown}
        color={theme.colors.attack}
      />
      <StatBox
        icon={
          <FontAwesome5
            name="shield-alt"
            size={18}
            color={theme.colors.defend}
          />
        }
        label="DEFENSE"
        value={computedStats.totalDefend}
        breakdown={computedStats.defendBreakdown}
        color={theme.colors.defend}
      />
      <StatBox
        icon={
          <MaterialCommunityIcons
            name="run-fast"
            size={20}
            color={theme.colors.move}
          />
        }
        label="MOVE"
        value={`${computedStats.moveDice}d6`}
        breakdown={computedStats.moveBreakdown}
        color={theme.colors.move}
      />
      <StatBox
        icon={
          <FontAwesome5
            name="gem"
            size={16}
            color={theme.colors.mind}
          />
        }
        label="MIND"
        value={computedStats.maxMindPoints}
        breakdown={computedStats.mindBreakdown}
        color={theme.colors.mind}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.section,
    gap: 6,
  },
  statBox: {
    flex: 1,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 3,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  statBreakdown: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 4,
  },
});
