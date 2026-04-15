import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { PURE_COLORS } from '@/constants/colors';
import { useTheme } from '@/theme/ThemeContext';
import { Hero, HeroConflict } from '@/types';
import { HERO_CLASSES } from '@/data/heroes';
import { withOpacity } from '@/theme/colorUtils';

interface ConflictResolverProps {
  conflicts: HeroConflict[];
  onResolve: (resolutions: Map<string, 'local' | 'remote'>) => void;
  onCancel?: () => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  conflicts,
  onResolve,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [choices, setChoices] = useState<Map<string, 'local' | 'remote'>>(new Map());
  // Two-phase close: showModal controls the BottomSheetModal present/dismiss,
  // pendingResolve holds the choices until the animation finishes.
  const [showModal, setShowModal] = useState(false);
  const pendingResolve = useRef<Map<string, 'local' | 'remote'> | null>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['70%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const hasConflicts = conflicts.length > 0;

  // Sync modal visibility with conflicts
  useEffect(() => {
    if (hasConflicts) {
      setShowModal(true);
      setChoices(new Map());
      pendingResolve.current = null;
    } else {
      setShowModal(false);
    }
  }, [hasConflicts]);

  // Present/dismiss BottomSheetModal based on showModal state
  useEffect(() => {
    if (showModal) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [showModal]);

  const handleApply = useCallback(() => {
    // Store choices, then start the close animation
    pendingResolve.current = new Map(choices);
    setShowModal(false);

    // Fallback for Android where onDismiss doesn't fire reliably
    if (Platform.OS === 'android') {
      setTimeout(() => {
        if (pendingResolve.current) {
          onResolve(pendingResolve.current);
          pendingResolve.current = null;
        }
      }, 400);
    }
  }, [choices, onResolve]);

  const handleDismiss = useCallback(() => {
    // Called after the BottomSheetModal dismiss animation completes
    if (pendingResolve.current) {
      onResolve(pendingResolve.current);
      pendingResolve.current = null;
    } else {
      // No pending resolve means this was a cancel/backdrop tap
      onCancel?.();
    }
  }, [onResolve, onCancel]);

  const handleCancel = useCallback(() => {
    pendingResolve.current = null;
    setShowModal(false);
  }, []);

  const setChoice = (heroId: string, choice: 'local' | 'remote') => {
    setChoices((prev) => {
      const next = new Map(prev);
      next.set(heroId, choice);
      return next;
    });
  };

  const allResolved = hasConflicts && conflicts.every((c) => choices.has(c.heroId));

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hasDeletionConflicts = conflicts.some((c) => c.local === null);
  const hasEditConflicts = conflicts.some((c) => c.local !== null);

  const summarizeHero = (hero: Hero) => {
    const cls = HERO_CLASSES[hero.heroClass];
    const lines: string[] = [];
    lines.push(`${hero.heroClass} - HP: ${hero.currentBodyPoints}/${cls.bodyPoints}, MP: ${hero.currentMindPoints}/${cls.mindPoints}`);
    lines.push(`Gold: ${hero.gold}, Quests: ${hero.questsCompleted.length}/14`);
    if (hero.equipment.weapon) lines.push(`Weapon: ${hero.equipment.weapon.name}`);
    if (hero.equipment.shield) lines.push(`Shield: ${hero.equipment.shield.name}`);
    if (hero.equipment.armor) lines.push(`Armor: ${hero.equipment.armor.name}`);
    if (hero.inventory.length > 0) lines.push(`Items: ${hero.inventory.map((i) => i.name).join(', ')}`);
    return lines;
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={false}
      onDismiss={handleDismiss}
      backgroundStyle={{ backgroundColor: theme.colors.background }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
    >
      <View style={styles.container}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Sync Conflict
          </Text>
          <Pressable onPress={handleCancel}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {hasDeletionConflicts && !hasEditConflicts
            ? conflicts.length === 1
              ? 'This hero was deleted on this device but still exists in the cloud. What would you like to do?'
              : `${conflicts.length} heroes were deleted on this device but still exist in the cloud. Choose what to do with each.`
            : hasEditConflicts && !hasDeletionConflicts
              ? conflicts.length === 1
                ? 'This hero has been changed both locally and in the cloud. Which version do you want to keep?'
                : `${conflicts.length} heroes have been changed both locally and in the cloud. Choose which version to keep for each.`
              : 'Some heroes need your attention before syncing. Choose what to do with each.'}
        </Text>

        <BottomSheetScrollView style={styles.scrollView}>
          {conflicts.map((conflict) => {
            const selected = choices.get(conflict.heroId);
            const isDeletion = conflict.local === null;

            return (
              <View
                key={conflict.heroId}
                style={[styles.conflictCard, { backgroundColor: theme.colors.surface }]}
              >
                <Text style={[styles.heroName, { color: theme.colors.text }]}>
                  {conflict.heroName}
                </Text>

                {isDeletion ? (
                  <>
                    <Pressable
                      style={[
                        styles.versionCard,
                        {
                          borderColor: selected === 'remote' ? theme.colors.accent : theme.colors.border,
                          borderWidth: selected === 'remote' ? 2 : 1,
                          backgroundColor: selected === 'remote' ? withOpacity(theme.colors.accent, 0.06) : 'transparent',
                        },
                      ]}
                      onPress={() => setChoice(conflict.heroId, 'remote')}
                    >
                      <View style={styles.versionHeader}>
                        <Ionicons name="cloud-download" size={16} color={theme.colors.success} />
                        <Text style={[styles.versionLabel, { color: theme.colors.text }]}>
                          Restore from Cloud
                        </Text>
                      </View>
                      {summarizeHero(conflict.remote).map((line, i) => (
                        <Text key={i} style={[styles.versionDetail, { color: theme.colors.textSecondary }]}>
                          {line}
                        </Text>
                      ))}
                    </Pressable>

                    <Pressable
                      style={[
                        styles.versionCard,
                        {
                          borderColor: selected === 'local' ? theme.colors.danger : theme.colors.border,
                          borderWidth: selected === 'local' ? 2 : 1,
                          backgroundColor: selected === 'local' ? withOpacity(theme.colors.danger, 0.06) : 'transparent',
                        },
                      ]}
                      onPress={() => setChoice(conflict.heroId, 'local')}
                    >
                      <View style={styles.versionHeader}>
                        <Ionicons name="trash" size={16} color={theme.colors.danger} />
                        <Text style={[styles.versionLabel, { color: theme.colors.text }]}>
                          Delete Permanently
                        </Text>
                      </View>
                      <Text style={[styles.versionDetail, { color: theme.colors.textSecondary }]}>
                        Remove this hero from the cloud as well
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Pressable
                      style={[
                        styles.versionCard,
                        {
                          borderColor: selected === 'local' ? theme.colors.accent : theme.colors.border,
                          borderWidth: selected === 'local' ? 2 : 1,
                          backgroundColor: selected === 'local' ? withOpacity(theme.colors.accent, 0.06) : 'transparent',
                        },
                      ]}
                      onPress={() => setChoice(conflict.heroId, 'local')}
                    >
                      <View style={styles.versionHeader}>
                        <Ionicons name="phone-portrait" size={16} color={theme.colors.text} />
                        <Text style={[styles.versionLabel, { color: theme.colors.text }]}>
                          This Device
                        </Text>
                        <Text style={[styles.versionDate, { color: theme.colors.textSecondary }]}>
                          {formatDate(conflict.local!.updatedAt)}
                        </Text>
                      </View>
                      {summarizeHero(conflict.local!).map((line, i) => (
                        <Text key={i} style={[styles.versionDetail, { color: theme.colors.textSecondary }]}>
                          {line}
                        </Text>
                      ))}
                    </Pressable>

                    <Pressable
                      style={[
                        styles.versionCard,
                        {
                          borderColor: selected === 'remote' ? theme.colors.accent : theme.colors.border,
                          borderWidth: selected === 'remote' ? 2 : 1,
                          backgroundColor: selected === 'remote' ? withOpacity(theme.colors.accent, 0.06) : 'transparent',
                        },
                      ]}
                      onPress={() => setChoice(conflict.heroId, 'remote')}
                    >
                      <View style={styles.versionHeader}>
                        <Ionicons name="cloud" size={16} color={theme.colors.text} />
                        <Text style={[styles.versionLabel, { color: theme.colors.text }]}>
                          Cloud
                        </Text>
                        <Text style={[styles.versionDate, { color: theme.colors.textSecondary }]}>
                          {formatDate(conflict.remote.updatedAt)}
                        </Text>
                      </View>
                      {summarizeHero(conflict.remote).map((line, i) => (
                        <Text key={i} style={[styles.versionDetail, { color: theme.colors.textSecondary }]}>
                          {line}
                        </Text>
                      ))}
                    </Pressable>
                  </>
                )}
              </View>
            );
          })}
        </BottomSheetScrollView>

        <Pressable
          style={[
            styles.resolveButton,
            {
              backgroundColor: allResolved ? theme.colors.accent : theme.colors.surfaceVariant,
              opacity: allResolved ? 1 : 0.5,
            },
          ]}
          onPress={handleApply}
          disabled={!allResolved}
        >
          <Text style={styles.resolveButtonText}>
            {allResolved ? 'Apply Choices' : 'Select a version for each hero'}
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel_700Bold',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  scrollView: {
    maxHeight: 400,
  },
  conflictCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  heroName: {
    fontSize: 18,
    fontFamily: 'Cinzel_600SemiBold',
    marginBottom: 12,
  },
  versionCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  versionLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  versionDate: {
    fontSize: 12,
  },
  versionDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  resolveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  resolveButtonText: {
    color: PURE_COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
