import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { getAvailableWeapons, NO_WEAPON, WEAPONS } from '@/data/weapons';
import { SHIELDS, NO_SHIELD, HELMETS, NO_HELMET, ARMOR, NO_ARMOR } from '@/data/armor';
import { Weapon, Shield, Helmet, Armor, EquipmentSlot } from '@/types';
import * as Haptics from 'expo-haptics';

type EquipmentItem = Weapon | Shield | Helmet | Armor;

interface EquipmentRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress: () => void;
  twoHanded?: boolean;
}

const EquipmentRow: React.FC<EquipmentRowProps> = ({
  icon,
  label,
  value,
  onPress,
  twoHanded,
}) => {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[
        styles.equipmentRow,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.equipmentIcon}>{icon}</View>
      <View style={styles.equipmentInfo}>
        <Text style={[styles.equipmentLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.equipmentValue, { color: theme.colors.text }]}>
          {value}
        </Text>
        {twoHanded && (
          <Text style={[styles.twoHandedBadge, { color: theme.colors.accent }]}>
            Two-Handed
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </Pressable>
  );
};

export const EquipmentSelector: React.FC = () => {
  const { theme } = useTheme();
  const { hero, equipWeapon, equipShield, equipHelmet, equipArmor } = useHero();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);

  if (!hero) return null;

  const openSelector = (slot: EquipmentSlot) => {
    setSelectedSlot(slot);
    setModalVisible(true);
  };

  const getItemsForSlot = (): EquipmentItem[] => {
    switch (selectedSlot) {
      case 'weapon':
        return [NO_WEAPON, ...getAvailableWeapons(hero.heroClass)];
      case 'shield':
        return [NO_SHIELD, ...SHIELDS];
      case 'helmet':
        return [NO_HELMET, ...HELMETS];
      case 'armor':
        return [NO_ARMOR, ...ARMOR];
      default:
        return [];
    }
  };

  const handleSelect = async (item: EquipmentItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (selectedSlot) {
      case 'weapon':
        equipWeapon(item.id === 'none' ? null : (item as Weapon));
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
    setModalVisible(false);
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
      return `+${(item as Weapon).attackDice} ATK`;
    }
    const defItem = item as Shield | Helmet | Armor;
    return defItem.defendDice > 0 ? `+${defItem.defendDice} DEF` : '';
  };

  const isShieldDisabled = hero.equipment.weapon?.twoHanded ?? false;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        EQUIPMENT
      </Text>

      <EquipmentRow
        icon={<MaterialCommunityIcons name="sword" size={24} color={theme.colors.accent} />}
        label="Weapon"
        value={hero.equipment.weapon?.name ?? 'None'}
        onPress={() => openSelector('weapon')}
        twoHanded={hero.equipment.weapon?.twoHanded}
      />

      <EquipmentRow
        icon={<FontAwesome5 name="shield-alt" size={22} color={isShieldDisabled ? theme.colors.textSecondary : theme.colors.accent} />}
        label={isShieldDisabled ? 'Shield (2H weapon equipped)' : 'Shield'}
        value={hero.equipment.shield?.name ?? 'None'}
        onPress={() => !isShieldDisabled && openSelector('shield')}
      />

      <EquipmentRow
        icon={<MaterialCommunityIcons name="hard-hat" size={24} color={theme.colors.accent} />}
        label="Helmet"
        value={hero.equipment.helmet?.name ?? 'None'}
        onPress={() => openSelector('helmet')}
      />

      <EquipmentRow
        icon={<MaterialCommunityIcons name="tshirt-crew" size={24} color={theme.colors.accent} />}
        label="Armor"
        value={hero.equipment.armor?.name ?? 'None'}
        onPress={() => openSelector('armor')}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select {selectedSlot?.charAt(0).toUpperCase()}{selectedSlot?.slice(1)}
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </Pressable>
            </View>

            <FlatList
              data={getItemsForSlot()}
              keyExtractor={(item) => item.id}
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
                      <Text
                        style={[
                          styles.itemName,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.description && (
                        <Text
                          style={[
                            styles.itemDescription,
                            { color: theme.colors.textSecondary },
                          ]}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.itemStats}>
                      {statLabel ? (
                        <Text
                          style={[
                            styles.itemStatValue,
                            { color: theme.colors.accent },
                          ]}
                        >
                          {statLabel}
                        </Text>
                      ) : null}
                      {item.goldCost > 0 && (
                        <Text
                          style={[
                            styles.itemGold,
                            { color: theme.colors.gold },
                          ]}
                        >
                          {item.goldCost}g
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.accent}
                      />
                    )}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
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
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  equipmentIcon: {
    width: 40,
    alignItems: 'center',
  },
  equipmentInfo: {
    flex: 1,
    marginLeft: 8,
  },
  equipmentLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  equipmentValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  twoHandedBadge: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
});
