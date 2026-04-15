import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/theme/ThemeContext';
import * as Haptics from 'expo-haptics';

const ONBOARDING_KEY = 'heroquest-onboarding-complete';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const markOnboardingComplete = async () => {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
};

export const isOnboardingComplete = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
};

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalSlides = 3;

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page !== currentPage) {
      setCurrentPage(page);
      Haptics.selectionAsync();
    }
  }, [currentPage]);

  const goToPage = (page: number) => {
    scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
  };

  const handleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markOnboardingComplete();
    router.replace('/auth');
  };

  const handleGuest = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markOnboardingComplete();
    router.replace('/');
  };

  const handleNext = () => {
    Haptics.selectionAsync();
    if (currentPage < totalSlides - 1) {
      goToPage(currentPage + 1);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/* Slide 1: Welcome */}
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
          <View style={styles.slideContent}>
            <MaterialCommunityIcons
              name="sword-cross"
              size={100}
              color={theme.colors.accent}
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              HeroQuest{'\n'}Hero Sheet
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Your digital companion for the HeroQuest board game
            </Text>
            <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }]}>
              This app is a fan-made project. It is not owned, approved, or endorsed by Hasbro, Inc. or any of the creators of HeroQuest. HeroQuest is a registered trademark of Hasbro, Inc.
            </Text>
          </View>
        </View>

        {/* Slide 2: Track Everything */}
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
          <View style={styles.slideContent}>
            <Text style={[styles.title, { color: theme.colors.text, marginBottom: 8 }]}>
              Track Everything
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, marginBottom: 32 }]}>
              Focus on playing, not bookkeeping
            </Text>
            <View style={styles.featureGrid}>
              <View style={styles.featureRow}>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}>
                  <Ionicons name="heart" size={28} color={theme.colors.health} />
                  <Text style={[styles.featureLabel, { color: theme.colors.text }]}>Health</Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons name="sword" size={28} color={theme.colors.accent} />
                  <Text style={[styles.featureLabel, { color: theme.colors.text }]}>Equipment</Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons name="auto-fix" size={28} color={theme.colors.mind} />
                  <Text style={[styles.featureLabel, { color: theme.colors.text }]}>Spells</Text>
                </View>
              </View>
              <View style={styles.featureRow}>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons name="gold" size={28} color={theme.colors.gold} />
                  <Text style={[styles.featureLabel, { color: theme.colors.text }]}>Gold</Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons name="bag-personal" size={28} color={theme.colors.accentSecondary} />
                  <Text style={[styles.featureLabel, { color: theme.colors.text }]}>Inventory</Text>
                </View>
                <View style={[styles.featureItem, { backgroundColor: theme.colors.surface }]}>
                  <MaterialCommunityIcons name="map-marker-check" size={28} color={theme.colors.success} />
                  <Text style={[styles.featureLabel, { color: theme.colors.text }]}>Quests</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Slide 3: Cloud Sync + Actions */}
        <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
          <View style={styles.slideContent}>
            <Ionicons
              name="cloud-done"
              size={80}
              color={theme.colors.accent}
            />
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Your Heroes,{'\n'}Everywhere
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary, marginBottom: 32 }]}>
              Sign in to save your heroes to the cloud and play on any device
            </Text>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}
              onPress={handleSignIn}
            >
              <Ionicons name="cloud-download-outline" size={22} color={theme.colors.textOnAccent} />
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </Pressable>
            <Pressable
              style={[
                styles.secondaryButton,
                { borderColor: theme.colors.accent },
              ]}
              onPress={handleGuest}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.accent }]}>
                Continue as Guest
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom: dots + next/skip */}
      <View style={styles.bottomBar}>
        <Pressable onPress={handleGuest} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
            {currentPage === totalSlides - 1 ? '' : 'Skip'}
          </Text>
        </Pressable>

        <View style={styles.dots}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentPage ? theme.colors.accent : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={styles.nextButton}
        >
          <Text style={[styles.nextText, { color: theme.colors.accent }]}>
            {currentPage === totalSlides - 1 ? '' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  disclaimer: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
    opacity: 0.7,
    paddingHorizontal: 8,
  },
  featureGrid: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureItem: {
    width: 96,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    maxWidth: 280,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 12,
    width: '100%',
    maxWidth: 280,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skipButton: {
    width: 60,
  },
  skipText: {
    fontSize: 16,
  },
  nextButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
