import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { SHARED_COLORS } from '@/constants/colors';

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
            size={24}
            color={SHARED_COLORS.attackIcon}
          />
        }
        label="ATTACK"
        value={computedStats.totalAttack}
        breakdown={computedStats.attackBreakdown}
        color={SHARED_COLORS.attackIcon}
      />
      <StatBox
        icon={
          <FontAwesome5
            name="shield-alt"
            size={22}
            color={SHARED_COLORS.defendIcon}
          />
        }
        label="DEFENSE"
        value={computedStats.totalDefend}
        breakdown={computedStats.defendBreakdown}
        color={SHARED_COLORS.defendIcon}
      />
      <StatBox
        icon={
          <MaterialCommunityIcons
            name="dice-multiple"
            size={24}
            color={SHARED_COLORS.moveIcon}
          />
        }
        label="MOVE"
        value={`${computedStats.moveDice}d6`}
        breakdown={computedStats.moveDice === 1 ? 'Plate Mail' : undefined}
        color={SHARED_COLORS.moveIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statBreakdown: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },
});
