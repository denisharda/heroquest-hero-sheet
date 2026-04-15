import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetFlatList, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { WEAPONS } from '@/data/weapons';
import { NO_SHIELD, NO_HELMET, NO_ARMOR } from '@/data/armor';
import { Weapon, Shield, Helmet, Armor, EquipmentSlot } from '@/types';
import * as Haptics from 'expo-haptics';
import { EquipmentSlotCard } from './EquipmentSlot';

type EquipmentItem = Weapon | Shield | Helmet | Armor;

export const EquipmentSelector: React.FC = () => {
  const { theme } = useTheme();
  const { hero, equipWeapon, equipShield, equipHelmet, equipArmor } = useHero();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);

  const snapPoints = useMemo(() => ['70%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  if (!hero) return null;

  const openSelector = (slot: EquipmentSlot) => {
    setSelectedSlot(slot);
    bottomSheetRef.current?.present();
  };

  const dismiss = () => {
    bottomSheetRef.current?.dismiss();
  };

  const getItemsForSlot = (): EquipmentItem[] => {
    switch (selectedSlot) {
      case 'weapon': {
        const owned = hero.ownedEquipment?.weapons ?? [];
        const ownedIds = new Set(owned.map((w) => w.id));
        const inventoryArtifactWeaponIds = hero.inventory
          .filter((i) => i.category === 'artifact')
          .map((i) => i.id);
        const artifactWeapons = WEAPONS.filter(
          (w) => w.isArtifact
            && inventoryArtifactWeaponIds.includes(w.id)
            && !ownedIds.has(w.id)
            && (!w.restrictedClasses || !w.restrictedClasses.includes(hero.heroClass))
        );
        return [...owned, ...artifactWeapons];
      }
      case 'shield':
        return [NO_SHIELD, ...(hero.ownedEquipment?.shields ?? [])];
      case 'helmet':
        return [NO_HELMET, ...(hero.ownedEquipment?.helmets ?? [])];
      case 'armor':
        return [NO_ARMOR, ...(hero.ownedEquipment?.armor ?? [])];
      default:
        return [];
    }
  };

  const handleSelect = async (item: EquipmentItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (selectedSlot) {
      case 'weapon':
        equipWeapon(item as Weapon);
        break;
      case 'shield':
        equipShield(item.id === 'none' ? null : (item as Shield));
        break;
      case 'helmet':
        equipHelmet(item.id === 'none' ? null : (item as Helmet));
        break;
      case 'armor':
        equipArmor(item.id === 'none' ? null : (item as Armor));
        break;
    }
    dismiss();
  };

  const getCurrentItemId = (): string => {
    switch (selectedSlot) {
      case 'weapon':
        return hero.equipment.weapon?.id ?? 'none';
      case 'shield':
        return hero.equipment.shield?.id ?? 'none';
      case 'helmet':
        return hero.equipment.helmet?.id ?? 'none';
      case 'armor':
        return hero.equipment.armor?.id ?? 'none';
      default:
        return 'none';
    }
  };

  const getStatLabel = (item: EquipmentItem): string => {
    if (selectedSlot === 'weapon') {
      return `${(item as Weapon).attackDice} ATK`;
    }
    const defItem = item as Shield | Helmet | Armor;
    return defItem.defendDice > 0 ? `+${defItem.defendDice} DEF` : '';
  };

  const isShieldDisabled = hero.equipment.weapon?.twoHanded ?? false;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        EQUIPPED
      </Text>

      {/* Top row: Helmet */}
      <View style={styles.topRow}>
        <EquipmentSlotCard
          slotType="helmet"
          item={hero.equipment.helmet}
          isArtifact={false}
          isDisabled={false}
          onPress={() => openSelector('helmet')}
        />
      </View>

      {/* Middle row: Weapon - Armor - Shield */}
      <View style={styles.middleRow}>
        <EquipmentSlotCard
          slotType="weapon"
          item={hero.equipment.weapon}
          isArtifact={hero.equipment.weapon?.isArtifact ?? false}
          isDisabled={false}
          onPress={() => openSelector('weapon')}
        />
        <EquipmentSlotCard
          slotType="armor"
          item={hero.equipment.armor}
          isArtifact={false}
          isDisabled={false}
          onPress={() => openSelector('armor')}
        />
        <EquipmentSlotCard
          slotType="shield"
          item={hero.equipment.shield}
          isArtifact={false}
          isDisabled={isShieldDisabled}
          onPress={() => openSelector('shield')}
        />
      </View>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Select {selectedSlot?.charAt(0).toUpperCase()}{selectedSlot?.slice(1)}
          </Text>
          <Pressable onPress={dismiss}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </Pressable>
        </View>

        <BottomSheetFlatList
          data={getItemsForSlot()}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No items in your armory for this slot.{'\n'}Add equipment from the Armory section below.
            </Text>
          }
          renderItem={({ item }) => {
            const isSelected = item.id === getCurrentItemId();
            const statLabel = getStatLabel(item);

            return (
              <Pressable
                style={[
                  styles.itemOption,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.accent + '30'
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.colors.text }]}>
                    {item.name}
                  </Text>
                  {item.description && (
                    <Text
                      style={[styles.itemDescription, { color: theme.colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>
                <View style={styles.itemStats}>
                  {statLabel ? (
                    <Text style={[styles.itemStatValue, { color: theme.colors.accent }]}>
                      {statLabel}
                    </Text>
                  ) : null}
                  {item.goldCost > 0 && (
                    <Text style={[styles.itemGold, { color: theme.colors.gold }]}>
                      {item.goldCost}g
                    </Text>
                  )}
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
                )}
              </Pressable>
            );
          }}
        />
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  topRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  middleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Cinzel_700Bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  itemStats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  itemStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemGold: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    padding: 24,
    lineHeight: 20,
  },
});
