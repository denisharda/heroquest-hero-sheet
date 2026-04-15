import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeContext';
import { withOpacity } from '@/theme/colorUtils';
import { PURE_COLORS } from '@/constants/colors';
import { useHero } from '@/hooks/useHero';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import { isOnboardingComplete } from './onboarding';
import {
  HeroIdentity,
  StatBlock,
  HealthTracker,
  EquipmentSelector,
  SpellTracker,
  GoldCounter,
  ArmoryList,
  InventoryList,
  QuestProgress,
  HeroSwitcher,
  ThemeToggle,
  ConflictResolver,
} from '@/components';

export default function CharacterSheet() {
  const { theme } = useTheme();
  const router = useRouter();
  const { hero, createHero } = useHero();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { isAuthenticated } = useAuth();
  const { isSyncing, syncError, conflicts, resolveConflicts, cancelConflicts, pendingRestoreCount, showPendingRestores, autoShowRestores } = useSync();
  const [showHeroSwitcher, setShowHeroSwitcher] = useState(false);
  const insets = useSafeAreaInsets();

  // Redirect to onboarding if not completed
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  useEffect(() => {
    isOnboardingComplete().then((complete) => {
      if (!complete) {
        router.replace('/onboarding');
      } else {
        setOnboardingChecked(true);
      }
    });
  }, []);

  // Auto-show pending restores after a delay (only when triggered from auth screen)
  useEffect(() => {
    if (autoShowRestores && pendingRestoreCount > 0) {
      const timer = setTimeout(() => {
        showPendingRestores();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoShowRestores, pendingRestoreCount]);

  // Only dark theme has texture
  const hasTexture = !!theme.backgroundTexture;

  // Don't render until onboarding check completes
  if (!onboardingChecked) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]} />;
  }

  if (!hero) {
    const emptyContent = (
      <>
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons
            name="sword-cross"
            size={80}
            color={theme.colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Welcome, Adventurer!
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
          >
            {isAuthenticated
              ? 'Create your first hero to begin your quest'
              : 'Sign in to load your heroes from the cloud, or start fresh'}
          </Text>

          {!isAuthenticated && (
            <Pressable
              style={[styles.createButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => router.push('/auth')}
            >
              <Ionicons name="cloud-download-outline" size={24} color={theme.colors.textOnAccent} />
              <Text style={styles.createButtonText}>Sign In</Text>
            </Pressable>
          )}

          <Pressable
            style={[
              styles.createButton,
              {
                backgroundColor: isAuthenticated
                  ? theme.colors.accent
                  : 'transparent',
                borderWidth: isAuthenticated ? 0 : 2,
                borderColor: theme.colors.accent,
                marginTop: isAuthenticated ? 0 : 16,
              },
            ]}
            onPress={() => setShowHeroSwitcher(true)}
          >
            <Ionicons
              name="add"
              size={24}
              color={isAuthenticated ? theme.colors.textOnAccent : theme.colors.accent}
            />
            <Text
              style={[
                styles.createButtonText,
                { color: isAuthenticated ? theme.colors.textOnAccent : theme.colors.accent },
              ]}
            >
              {isAuthenticated ? 'Create Hero' : 'Continue as Guest'}
            </Text>
          </Pressable>

          {isAuthenticated && pendingRestoreCount > 0 && (
            <Pressable
              style={[
                styles.createButton,
                {
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: theme.colors.success,
                  marginTop: 16,
                },
              ]}
              onPress={showPendingRestores}
            >
              <Ionicons name="cloud-download-outline" size={24} color={theme.colors.success} />
              <Text
                style={[
                  styles.createButtonText,
                  { color: theme.colors.success },
                ]}
              >
                Restore from Cloud ({pendingRestoreCount})
              </Text>
            </Pressable>
          )}
        </View>

        <HeroSwitcher
          visible={showHeroSwitcher}
          onClose={() => setShowHeroSwitcher(false)}
        />
        <ConflictResolver
          conflicts={conflicts}
          onResolve={resolveConflicts}
          onCancel={cancelConflicts}
        />
      </>
    );

    if (hasTexture) {
      return (
        <ImageBackground
          source={theme.backgroundTexture}
          resizeMode="repeat"
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {emptyContent}
        </ImageBackground>
      );
    }

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
        {emptyContent}
      </View>
    );
  }

  const mainContent = (
    <>
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border, paddingTop: insets.top + 12 },
        ]}
      >
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="sword-cross"
            size={28}
            color={theme.colors.accent}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Character Sheet
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            style={[
              styles.headerButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => setShowHeroSwitcher(true)}
          >
            <Ionicons name="people" size={22} color={theme.colors.text} />
          </Pressable>
          <Pressable
            style={[
              styles.headerButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => router.push('/auth')}
          >
            <Ionicons
              name={isAuthenticated ? 'person-circle' : 'person-circle-outline'}
              size={22}
              color={isAuthenticated ? theme.colors.accent : theme.colors.text}
            />
          </Pressable>
          <ThemeToggle size={22} />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroIdentity />
        <StatBlock />
        <HealthTracker />
        <EquipmentSelector />
        <SpellTracker />
        <GoldCounter />
        <ArmoryList />
        <InventoryList />
        <QuestProgress />

        {/* Spacer for bottom actions */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom + 12,
          },
        ]}
      >
        <Pressable
          style={[
            styles.actionButton,
            {
              backgroundColor: canUndo
                ? withOpacity(theme.colors.accent, 0.13)
                : theme.colors.surfaceVariant,
              opacity: canUndo ? 1 : 0.5,
            },
          ]}
          onPress={undo}
          disabled={!canUndo}
        >
          <Ionicons
            name="arrow-undo"
            size={20}
            color={canUndo ? theme.colors.accent : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionButtonText,
              {
                color: canUndo ? theme.colors.accent : theme.colors.textSecondary,
              },
            ]}
          >
            Undo
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            {
              backgroundColor: canRedo
                ? withOpacity(theme.colors.accent, 0.13)
                : theme.colors.surfaceVariant,
              opacity: canRedo ? 1 : 0.5,
            },
          ]}
          onPress={redo}
          disabled={!canRedo}
        >
          <Ionicons
            name="arrow-redo"
            size={20}
            color={canRedo ? theme.colors.accent : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionButtonText,
              {
                color: canRedo ? theme.colors.accent : theme.colors.textSecondary,
              },
            ]}
          >
            Redo
          </Text>
        </Pressable>

        <View style={styles.savedIndicator}>
          <Ionicons
            name={
              !isAuthenticated
                ? 'save'
                : isSyncing
                  ? 'sync'
                  : syncError
                    ? 'cloud-offline'
                    : 'cloud-done'
            }
            size={16}
            color={
              syncError
                ? theme.colors.danger
                : theme.colors.success
            }
          />
          <Text
            style={[styles.savedText, { color: theme.colors.textSecondary }]}
          >
            {!isAuthenticated
              ? 'Auto-saved'
              : isSyncing
                ? 'Syncing...'
                : syncError
                  ? 'Sync error'
                  : 'Synced'}
          </Text>
        </View>
      </View>

      <HeroSwitcher
        visible={showHeroSwitcher}
        onClose={() => setShowHeroSwitcher(false)}
      />

      <ConflictResolver
        conflicts={conflicts}
        onResolve={resolveConflicts}
        onCancel={cancelConflicts}
      />
    </>
  );

  if (hasTexture) {
    return (
      <ImageBackground
        source={theme.backgroundTexture}
        resizeMode="repeat"
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {mainContent}
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {mainContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Cinzel_700Bold',
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  savedIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  savedText: {
    fontSize: 12,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Cinzel_700Bold',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: PURE_COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
