import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { StyleSheet, View } from 'react-native';

function RootLayoutNav() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="heroes"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="spell/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
