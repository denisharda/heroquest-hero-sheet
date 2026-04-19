import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme/ThemeContext';
import { ActiveEffectRow } from '@/lib/activeEffects';

interface Props {
  gear: ActiveEffectRow[];
  artifacts: ActiveEffectRow[];
}

export const ActiveEffectsSheet = forwardRef<BottomSheetModal, Props>(
  ({ gear, artifacts }, ref) => {
    const { theme } = useTheme();
    const snapPoints = useMemo(() => ['65%'], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      [],
    );

    const totalCount = gear.length + artifacts.length;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Active Effects</Text>

          {totalCount === 0 && (
            <Text style={[styles.empty, { color: theme.colors.textSecondary }]}>
              No active effects. Equip gear or collect artifacts to see them here.
            </Text>
          )}

          {gear.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
                Equipped Gear
              </Text>
              {gear.map((row) => (
                <EffectRowView key={`gear-${row.itemId}`} row={row} />
              ))}
            </View>
          )}

          {artifacts.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
                Artifacts
              </Text>
              {artifacts.map((row) => (
                <EffectRowView key={`artifact-${row.itemId}`} row={row} />
              ))}
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

ActiveEffectsSheet.displayName = 'ActiveEffectsSheet';

const EffectRowView: React.FC<{ row: ActiveEffectRow }> = ({ row }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.rowHeader}>
        <Text style={[styles.rowName, { color: theme.colors.text }]}>{row.name}</Text>
        {row.isArtifact && (
          <View style={[styles.artifactBadge, { backgroundColor: theme.colors.itemArtifact }]}>
            <Text style={[styles.artifactBadgeText, { color: theme.colors.textOnAccent }]}>
              Artifact
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.rowEffect, { color: theme.colors.textSecondary }]}>{row.effect}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  empty: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
  },
  artifactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  artifactBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  rowEffect: {
    fontSize: 13,
    lineHeight: 18,
  },
});
