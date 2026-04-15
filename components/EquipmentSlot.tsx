import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { ITEM_CATEGORY_COLORS } from '@/constants/colors';
import { Weapon, Shield, Helmet, Armor, EquipmentSlot as SlotType } from '@/types';
import * as Haptics from 'expo-haptics';

type EquipmentItem = Weapon | Shield | Helmet | Armor;

interface EquipmentSlotProps {
  slotType: SlotType;
  item: EquipmentItem | null;
  isArtifact: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

const SLOT_ICONS: Record<SlotType, { family: 'mci' | 'fa5'; name: string; size: number }> = {
  weapon: { family: 'mci', name: 'sword', size: 26 },
  shield: { family: 'fa5', name: 'shield-alt', size: 22 },
  helmet: { family: 'mci', name: 'hard-hat', size: 26 },
  armor: { family: 'mci', name: 'tshirt-crew', size: 26 },
};

const SLOT_LABELS: Record<SlotType, string> = {
  weapon: 'Weapon',
  shield: 'Shield',
  helmet: 'Helmet',
  armor: 'Armor',
};

function getStatText(slotType: SlotType, item: EquipmentItem): string {
  if (slotType === 'weapon') {
    return `${(item as Weapon).attackDice} ATK`;
  }
  const defItem = item as Shield | Helmet | Armor;
  return defItem.defendDice > 0 ? `+${defItem.defendDice} DEF` : '';
}

function SlotIcon({ slotType, color, opacity }: { slotType: SlotType; color: string; opacity: number }) {
  const config = SLOT_ICONS[slotType];
  if (config.family === 'fa5') {
    return <FontAwesome5 name={config.name} size={config.size} color={color} style={{ opacity }} />;
  }
  return <MaterialCommunityIcons name={config.name as any} size={config.size} color={color} style={{ opacity }} />;
}

export const EquipmentSlotCard: React.FC<EquipmentSlotProps> = ({
  slotType,
  item,
  isArtifact,
  isDisabled,
  onPress,
}) => {
  const { theme } = useTheme();
  const isEmpty = item === null;

  const handlePress = async () => {
    if (isDisabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // --- Disabled state (shield blocked by 2H weapon) ---
  if (isDisabled) {
    return (
      <View style={[styles.slot, styles.slotMiddle, {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border + '40',
        borderStyle: 'dashed' as any,
        borderWidth: 1.5,
        opacity: 0.5,
      }]}>
        <SlotIcon slotType={slotType} color={theme.colors.textSecondary} opacity={0.2} />
        <Text style={[styles.slotLabel, { color: theme.colors.textSecondary }]}>
          {SLOT_LABELS[slotType]}
        </Text>
        <View style={styles.blockedRow}>
          <Ionicons name="lock-closed" size={10} color={theme.colors.textSecondary} />
          <Text style={[styles.blockedText, { color: theme.colors.textSecondary }]}>Blocked</Text>
        </View>
      </View>
    );
  }

  // --- Empty state ---
  if (isEmpty) {
    return (
      <Pressable
        onPress={handlePress}
        style={[styles.slot, slotType === 'helmet' ? styles.slotHelmet : styles.slotMiddle, {
          backgroundColor: theme.isDark ? '#1a1a1a' : theme.colors.surfaceVariant,
          borderColor: theme.colors.border + '80',
          borderStyle: 'dashed' as any,
          borderWidth: 1.5,
        }]}
      >
        <SlotIcon slotType={slotType} color={theme.colors.textSecondary} opacity={0.3} />
        <Text style={[styles.slotLabel, { color: theme.colors.textSecondary + '80' }]}>
          {SLOT_LABELS[slotType]}
        </Text>
        <Text style={[styles.emptyName, { color: theme.colors.textSecondary + '60' }]}>
          No {SLOT_LABELS[slotType].toLowerCase()}
        </Text>
      </Pressable>
    );
  }

  // --- Normal item state (non-artifact) ---
  // Artifact state will be added in Task 2
  return (
    <Pressable
      onPress={handlePress}
      style={[styles.slot, slotType === 'helmet' ? styles.slotHelmet : styles.slotMiddle, {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1.5,
      }]}
    >
      <SlotIcon slotType={slotType} color={theme.colors.accent} opacity={1} />
      <Text style={[styles.slotLabel, { color: theme.colors.textSecondary }]}>
        {SLOT_LABELS[slotType]}
      </Text>
      <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
        {getStatText(slotType, item)}
      </Text>
      {(item as Weapon).twoHanded && (
        <Text style={[styles.badge, { color: theme.colors.accent }]}>2H</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  slotHelmet: {
    width: 180,
    alignSelf: 'center',
  },
  slotMiddle: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyName: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  statText: {
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  blockedText: {
    fontSize: 9,
    fontWeight: '600',
  },
});
