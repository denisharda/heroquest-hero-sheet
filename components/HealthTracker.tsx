import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface PointTrackerProps {
  label: string;
  current: number;
  max: number;
  filledColor: string;
  emptyColor: string;
  icon: string;
  onTap: () => void;
  onLongPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PointTracker: React.FC<PointTrackerProps> = ({
  label,
  current,
  max,
  filledColor,
  emptyColor,
  icon,
  onTap,
  onLongPress,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue('transparent');

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: backgroundColor.value,
  }));

  const handlePress = async () => {
    // Damage animation - red flash
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onTap();
  };

  const handleLongPress = async () => {
    // Heal animation - green pulse
    scale.value = withSequence(
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onLongPress();
  };

  const points = [];
  for (let i = 0; i < max; i++) {
    const isFilled = i < current;
    points.push(
      <FontAwesome5
        key={i}
        name={icon}
        size={20}
        color={isFilled ? filledColor : emptyColor}
        solid={isFilled}
        style={styles.pointIcon}
      />
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={300}
      style={[
        styles.trackerContainer,
        { backgroundColor: theme.colors.surface },
        animatedContainerStyle,
      ]}
    >
      <View style={styles.trackerHeader}>
        <Text style={[styles.trackerLabel, { color: theme.colors.text }]}>
          {label}
        </Text>
        <Text style={[styles.trackerValue, { color: filledColor }]}>
          {current} / {max}
        </Text>
      </View>
      <View style={styles.pointsRow}>{points}</View>
      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        Tap to damage • Long press to heal
      </Text>
    </AnimatedPressable>
  );
};

export const HealthTracker: React.FC = () => {
  const { theme } = useTheme();
  const { hero, computedStats, adjustBodyPoints, adjustMindPoints } = useHero();

  if (!hero || !computedStats) return null;

  return (
    <View style={styles.container}>
      <PointTracker
        label="BODY POINTS"
        current={hero.currentBodyPoints}
        max={computedStats.maxBodyPoints}
        filledColor={theme.colors.health}
        emptyColor={theme.colors.healthEmpty}
        icon="heart"
        onTap={() => adjustBodyPoints(-1)}
        onLongPress={() => adjustBodyPoints(1)}
      />
      <PointTracker
        label="MIND POINTS"
        current={hero.currentMindPoints}
        max={computedStats.maxMindPoints}
        filledColor={theme.colors.mind}
        emptyColor={theme.colors.mindEmpty}
        icon="gem"
        onTap={() => adjustMindPoints(-1)}
        onLongPress={() => adjustMindPoints(1)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  trackerContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackerLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  trackerValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pointIcon: {
    marginRight: 2,
  },
  hint: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
