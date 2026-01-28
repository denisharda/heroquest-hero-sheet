import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ThemeToggleProps {
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 28 }) => {
  const { theme, toggleTheme } = useTheme();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons
        name={theme.isDark ? 'sunny' : 'moon'}
        size={size}
        color={theme.isDark ? theme.colors.gold : theme.colors.primary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
