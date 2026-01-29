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
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import {
  HeroIdentity,
  StatBlock,
  HealthTracker,
  EquipmentSelector,
  SpellTracker,
  GoldCounter,
  InventoryList,
  QuestProgress,
  HeroSwitcher,
  ThemeToggle,
} from '@/components';

export default function CharacterSheet() {
  const { theme } = useTheme();
  const { hero, createHero } = useHero();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const [showHeroSwitcher, setShowHeroSwitcher] = useState(false);
  const insets = useSafeAreaInsets();

  // Auto-create a hero if none exists
  useEffect(() => {
    if (!hero) {
      // Check if there are any heroes, if not we'll show the switcher
    }
  }, [hero]);

  // Only dark theme has texture
  const hasTexture = !!theme.backgroundTexture;

  if (!hero) {
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
              Create your first hero to begin your quest
            </Text>
            <Pressable
              style={[styles.createButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => setShowHeroSwitcher(true)}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Hero</Text>
            </Pressable>
          </View>
          <HeroSwitcher
            visible={showHeroSwitcher}
            onClose={() => setShowHeroSwitcher(false)}
          />
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
            Create your first hero to begin your quest
          </Text>
          <Pressable
            style={[styles.createButton, { backgroundColor: theme.colors.accent }]}
            onPress={() => setShowHeroSwitcher(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Hero</Text>
          </Pressable>
        </View>

        <HeroSwitcher
          visible={showHeroSwitcher}
          onClose={() => setShowHeroSwitcher(false)}
        />
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
                ? theme.colors.accent + '20'
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
                ? theme.colors.accent + '20'
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
            name="cloud-done"
            size={16}
            color={theme.colors.success}
          />
          <Text
            style={[styles.savedText, { color: theme.colors.textSecondary }]}
          >
            Auto-saved
          </Text>
        </View>
      </View>

      <HeroSwitcher
        visible={showHeroSwitcher}
        onClose={() => setShowHeroSwitcher(false)}
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
    fontSize: 20,
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
