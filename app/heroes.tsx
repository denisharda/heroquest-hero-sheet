import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { HeroSwitcher } from '@/components';

export default function HeroesScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HeroSwitcher
        visible={true}
        onClose={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
