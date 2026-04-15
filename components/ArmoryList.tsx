import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetSectionList, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { getAvailableWeapons, WEAPONS } from '@/data/weapons';
import { getAvailableShields, getAvailableHelmets, getAvailableArmor } from '@/data/armor';
import { Weapon, Shield, Helmet, Armor, EquipmentSlot } from '@/types';
import * as Haptics from 'expo-haptics';

type AnyEquipment = Weapon | Shield | Helmet | Armor;

interface OwnedItemRowProps {
  item: AnyEquipment;
  slot: EquipmentSlot;
  isEquipped: boolean;
  statLabel: string;
  onPress: () => void;
}

const SLOT_ICONS: Record<EquipmentSlot, { name: string; lib: 'mci' | 'fa5' }> = {
  weapon: { name: 'sword', lib: 'mci' },
  shield: { name: 'shield-alt', lib: 'fa5' },
  helmet: { name: 'hard-hat', lib: 'mci' },
  armor: { name: 'tshirt-crew', lib: 'mci' },
};

const OwnedItemRow: React.FC<OwnedItemRowProps> = ({ item, slot, isEquipped, statLabel, onPress }) => {
  const { theme } = useTheme();
  const iconDef = SLOT_ICONS[slot];

  return (
    <Pressable
      style={[
        styles.itemRow,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
      onPress={onPress}
    >
      {iconDef.lib === 'fa5' ? (
        <FontAwesome5 name={iconDef.name} size={20} color={theme.colors.accent} />
      ) : (
        <MaterialCommunityIcons name={iconDef.name as any} size={22} color={theme.colors.accent} />
      )}
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemStat, { color: theme.colors.accent }]}>{statLabel}</Text>
      </View>
      {isEquipped && (
        <View style={[styles.equippedBadge, { backgroundColor: theme.colors.accent + '30' }]}>
          <Text style={[styles.equippedText, { color: theme.colors.accent }]}>Equipped</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );
};

export const ArmoryList: React.FC = () => {
  const { theme } = useTheme();
  const {
    hero,
    equipWeapon, equipShield, equipHelmet, equipArmor,
    addOwnedWeapon, addOwnedShield, addOwnedHelmet, addOwnedArmor,
    removeOwnedWeapon, removeOwnedShield, removeOwnedHelmet, removeOwnedArmor,
  } = useHero();
  const detailSheetRef = useRef<BottomSheetModal>(null);
  const catalogSheetRef = useRef<BottomSheetModal>(null);
  const [detailItem, setDetailItem] = useState<{ item: AnyEquipment; slot: EquipmentSlot } | null>(null);

  const catalogSnapPoints = useMemo(() => ['70%'], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  if (!hero) return null;

  const owned = hero.ownedEquipment ?? { weapons: [], shields: [], helmets: [], armor: [] };

  const isEquipped = (slot: EquipmentSlot, itemId: string): boolean => {
    switch (slot) {
      case 'weapon': return hero.equipment.weapon?.id === itemId;
      case 'shield': return hero.equipment.shield?.id === itemId;
      case 'helmet': return hero.equipment.helmet?.id === itemId;
      case 'armor': return hero.equipment.armor?.id === itemId;
      default: return false;
    }
  };

  const getStatLabel = (slot: EquipmentSlot, item: AnyEquipment): string => {
    if (slot === 'weapon') return `${(item as Weapon).attackDice} ATK`;
    const def = (item as Shield | Helmet | Armor).defendDice;
    return def > 0 ? `+${def} DEF` : '';
  };

  const isOwned = (slot: EquipmentSlot, itemId: string): boolean => {
    switch (slot) {
      case 'weapon': return owned.weapons.some((w) => w.id === itemId);
      case 'shield': return owned.shields.some((s) => s.id === itemId);
      case 'helmet': return owned.helmets.some((h) => h.id === itemId);
      case 'armor': return owned.armor.some((a) => a.id === itemId);
      default: return false;
    }
  };

  const openDetail = (item: AnyEquipment, slot: EquipmentSlot) => {
    setDetailItem({ item, slot });
    detailSheetRef.current?.present();
  };

  const handleAdd = async (slot: EquipmentSlot, item: AnyEquipment) => {
    if (isOwned(slot, item.id)) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (slot) {
      case 'weapon': addOwnedWeapon(item as Weapon); break;
      case 'shield': addOwnedShield(item as Shield); break;
      case 'helmet': addOwnedHelmet(item as Helmet); break;
      case 'armor': addOwnedArmor(item as Armor); break;
    }
    catalogSheetRef.current?.dismiss();
  };

  const handleEquip = async (slot: EquipmentSlot, item: AnyEquipment) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch (slot) {
      case 'weapon': equipWeapon(item as Weapon); break;
      case 'shield': equipShield(item as Shield); break;
      case 'helmet': equipHelmet(item as Helmet); break;
      case 'armor': equipArmor(item as Armor); break;
    }
    detailSheetRef.current?.dismiss();
  };

  const handleUnequip = async (slot: EquipmentSlot) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switch (slot) {
      case 'weapon': break;
      case 'shield': equipShield(null); break;
      case 'helmet': equipHelmet(null); break;
      case 'armor': equipArmor(null); break;
    }
    detailSheetRef.current?.dismiss();
  };

  const handleDiscard = async (slot: EquipmentSlot, itemId: string) => {
    if (isEquipped(slot, itemId)) {
      Alert.alert('Cannot Discard', 'Unequip this item first before discarding.');
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    switch (slot) {
      case 'weapon': removeOwnedWeapon(itemId); break;
      case 'shield': removeOwnedShield(itemId); break;
      case 'helmet': removeOwnedHelmet(itemId); break;
      case 'armor': removeOwnedArmor(itemId); break;
    }
    detailSheetRef.current?.dismiss();
  };

  type EquipSection = { title: string; slot: EquipmentSlot; data: AnyEquipment[] };

  const allOwnedSections: EquipSection[] = [
    { title: 'Weapons', slot: 'weapon' as EquipmentSlot, data: owned.weapons },
    { title: 'Shields', slot: 'shield' as EquipmentSlot, data: owned.shields },
    { title: 'Helmets', slot: 'helmet' as EquipmentSlot, data: owned.helmets },
    { title: 'Armor', slot: 'armor' as EquipmentSlot, data: owned.armor },
  ];
  const ownedSections = allOwnedSections.filter((s) => s.data.length > 0);

  const totalOwnedCount = owned.weapons.length + owned.shields.length + owned.helmets.length + owned.armor.length;

  const catalogSections: EquipSection[] = [
    { title: 'Weapons', slot: 'weapon' as EquipmentSlot, data: getAvailableWeapons(hero.heroClass) },
    { title: 'Shields', slot: 'shield' as EquipmentSlot, data: getAvailableShields(hero.heroClass) },
    { title: 'Helmets', slot: 'helmet' as EquipmentSlot, data: getAvailableHelmets(hero.heroClass) },
    { title: 'Armor', slot: 'armor' as EquipmentSlot, data: getAvailableArmor(hero.heroClass) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>ARMORY</Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.colors.accent }]}
          onPress={() => catalogSheetRef.current?.present()}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {totalOwnedCount === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
          <MaterialCommunityIcons name="sword-cross" size={40} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No equipment owned
          </Text>
        </View>
      ) : (
        ownedSections.map((section) => (
          <View key={section.slot}>
            <Text style={[styles.subHeader, { color: theme.colors.textSecondary }]}>
              {section.title}
            </Text>
            {section.data.map((item) => (
              <OwnedItemRow
                key={item.id}
                item={item}
                slot={section.slot}
                isEquipped={isEquipped(section.slot, item.id)}
                statLabel={getStatLabel(section.slot, item)}
                onPress={() => openDetail(item, section.slot)}
              />
            ))}
          </View>
        ))
      )}

      {/* Detail Sheet */}
      <BottomSheetModal
        ref={detailSheetRef}
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
      >
        <BottomSheetScrollView style={styles.sheetContent}>
          {detailItem && (
            <>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {detailItem.item.name}
                </Text>
                <Pressable onPress={() => detailSheetRef.current?.dismiss()}>
                  <Ionicons name="close" size={28} color={theme.colors.text} />
                </Pressable>
              </View>

              <View style={styles.detailBadgeRow}>
                <View style={[styles.typeBadge, { backgroundColor: theme.colors.accent + '30' }]}>
                  <Text style={[styles.typeBadgeText, { color: theme.colors.accent }]}>
                    {detailItem.slot.charAt(0).toUpperCase() + detailItem.slot.slice(1)}
                  </Text>
                </View>
                <Text style={[styles.detailStat, { color: theme.colors.accent }]}>
                  {getStatLabel(detailItem.slot, detailItem.item)}
                </Text>
                {detailItem.item.goldCost > 0 && (
                  <Text style={[styles.detailGold, { color: theme.colors.gold }]}>
                    {detailItem.item.goldCost}g
                  </Text>
                )}
              </View>

              {detailItem.item.description && (
                <Text style={[styles.detailDesc, { color: theme.colors.textSecondary }]}>
                  {detailItem.item.description}
                </Text>
              )}

              <View style={styles.detailActions}>
                {isEquipped(detailItem.slot, detailItem.item.id) ? (
                  detailItem.slot !== 'weapon' && (
                    <Pressable
                      style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}
                      onPress={() => handleUnequip(detailItem.slot)}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Unequip</Text>
                    </Pressable>
                  )
                ) : (
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
                    onPress={() => handleEquip(detailItem.slot, detailItem.item)}
                  >
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Equip</Text>
                  </Pressable>
                )}

                <Pressable
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isEquipped(detailItem.slot, detailItem.item.id)
                        ? theme.colors.surface
                        : theme.colors.danger + '20',
                      borderColor: isEquipped(detailItem.slot, detailItem.item.id)
                        ? theme.colors.border
                        : theme.colors.danger,
                      borderWidth: 1,
                      opacity: isEquipped(detailItem.slot, detailItem.item.id) ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => handleDiscard(detailItem.slot, detailItem.item.id)}
                  disabled={isEquipped(detailItem.slot, detailItem.item.id)}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      {
                        color: isEquipped(detailItem.slot, detailItem.item.id)
                          ? theme.colors.textSecondary
                          : theme.colors.danger,
                      },
                    ]}
                  >
                    {isEquipped(detailItem.slot, detailItem.item.id) ? 'Unequip first' : 'Discard'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* Catalog Sheet */}
      <BottomSheetModal
        ref={catalogSheetRef}
        snapPoints={catalogSnapPoints}
        backdropComponent={renderBackdrop}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: theme.colors.background }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.textSecondary }}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Add Equipment
          </Text>
          <Pressable onPress={() => catalogSheetRef.current?.dismiss()}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </Pressable>
        </View>

        <BottomSheetSectionList
          sections={catalogSections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <Text
              style={[
                styles.sectionHeader,
                { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text },
              ]}
            >
              {section.title}
            </Text>
          )}
          renderItem={({ item, section }) => {
            const alreadyOwned = isOwned(section.slot, item.id);
            return (
              <Pressable
                style={[
                  styles.catalogItem,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    opacity: alreadyOwned ? 0.5 : 1,
                  },
                ]}
                onPress={() => handleAdd(section.slot, item)}
                disabled={alreadyOwned}
              >
                <View style={styles.catalogInfo}>
                  <Text style={[styles.catalogName, { color: theme.colors.text }]}>
                    {item.name}
                    {alreadyOwned && ' (owned)'}
                  </Text>
                  {item.description && (
                    <Text
                      style={[styles.catalogDesc, { color: theme.colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  )}
                </View>
                <View style={styles.catalogStats}>
                  <Text style={[styles.catalogStatValue, { color: theme.colors.accent }]}>
                    {getStatLabel(section.slot, item)}
                  </Text>
                  {item.goldCost > 0 && (
                    <Text style={[styles.catalogGold, { color: theme.colors.gold }]}>
                      {item.goldCost}g
                    </Text>
                  )}
                </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
  },
  subHeader: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
    gap: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemStat: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  equippedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  equippedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  detailBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailStat: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailGold: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  detailActions: {
    gap: 10,
    paddingBottom: 24,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  catalogInfo: {
    flex: 1,
  },
  catalogName: {
    fontSize: 14,
    fontWeight: '600',
  },
  catalogDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  catalogStats: {
    alignItems: 'flex-end',
  },
  catalogStatValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  catalogGold: {
    fontSize: 11,
    fontWeight: '600',
  },
});
