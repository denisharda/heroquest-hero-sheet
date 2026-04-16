import React, { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';
import { StyleSheet, View, Text, Platform } from 'react-native';
import {
  useFonts,
  Cinzel_400Regular,
  Cinzel_500Medium,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import * as Linking from 'expo-linking';
import { supabase, extractSessionFromUrl } from '@/lib/supabase';
import { syncService } from '@/services/syncService';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

function SyncLifecycle() {
  const syncInitialized = useRef(false);

  useEffect(() => {
    const initSync = async (userId: string) => {
      try {
        await syncService.init(userId);
        await syncService.syncNow();
      } catch (err) {
        console.warn('Sync initialization failed:', err);
        // Reset so retry is possible on next auth event
        syncInitialized.current = false;
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user && !syncInitialized.current) {
          syncInitialized.current = true;
          await initSync(session.user.id);
        } else if (!session && syncInitialized.current) {
          syncInitialized.current = false;
          syncService.destroy();
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && !syncInitialized.current) {
        syncInitialized.current = true;
        await initSync(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (syncInitialized.current) {
        syncService.destroy();
        syncInitialized.current = false;
      }
    };
  }, []);

  return null;
}

/** Listens for deep link auth callbacks (email verification) and establishes the Supabase session. */
function AuthDeepLinkHandler() {
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const tokens = extractSessionFromUrl(url);
      if (!tokens) return;
      await supabase.auth.setSession(tokens);
    };

    // Handle URL that launched the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // Handle URL while app is already running (warm start)
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, []);

  return null;
}

function RootLayoutNav() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <SyncLifecycle />
      <AuthDeepLinkHandler />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="onboarding"
          options={{
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="heroes"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="auth"
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
        <Stack.Screen
          name="item/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="quest/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });

  // On web, fonts may take longer or fail - add timeout fallback
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const ready = fontsLoaded || timedOut || Platform.OS === 'web';

  if (!ready) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <BottomSheetModalProvider>
          <RootLayoutNav />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8D9B5',
  },
});
