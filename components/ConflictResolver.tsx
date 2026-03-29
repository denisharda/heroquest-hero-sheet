import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { Hero, HeroConflict } from '@/types';
import { HERO_CLASSES } from '@/data/heroes';

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
  // Two-phase close: showModal controls the Modal visible prop,
  // pendingResolve holds the choices until the animation finishes.
  const [showModal, setShowModal] = useState(false);
  const pendingResolve = useRef<Map<string, 'local' | 'remote'> | null>(null);

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
    // Called after the Modal slide-out animation completes (iOS)
    if (pendingResolve.current) {
      onResolve(pendingResolve.current);
      pendingResolve.current = null;
    }
  }, [onResolve]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    // Delay cancel callback for animation to finish
    if (Platform.OS === 'android') {
      setTimeout(() => onCancel?.(), 400);
    } else {
      // Will be called via onDismiss if no pending resolve
      pendingResolve.current = null;
      // onDismiss won't call onResolve since pendingResolve is null,
      // so we need a separate mechanism for cancel
      setTimeout(() => onCancel?.(), 400);
    }
  }, [onCancel]);

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
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
      onDismiss={handleDismiss}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Sync Conflict
            </Text>
            {onCancel && (
              <Pressable onPress={handleCancel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </Pressable>
            )}
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

          <ScrollView style={styles.scrollView}>
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
                            backgroundColor: selected === 'remote' ? theme.colors.accent + '10' : 'transparent',
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
                            backgroundColor: selected === 'local' ? theme.colors.danger + '10' : 'transparent',
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
                            backgroundColor: selected === 'local' ? theme.colors.accent + '10' : 'transparent',
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
                            backgroundColor: selected === 'remote' ? theme.colors.accent + '10' : 'transparent',
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
          </ScrollView>

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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Cinzel_700Bold',
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 0,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
