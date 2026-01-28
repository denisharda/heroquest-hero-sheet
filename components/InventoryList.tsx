import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  SectionList,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { ITEM_DEFINITIONS, ITEM_CATEGORIES, createItemInstance } from '@/data/items';
import { Item, ItemCategory } from '@/types';
import { ITEM_CATEGORY_COLORS } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface InventoryItemProps {
  item: Item;
  onAdjustQuantity: (delta: number) => void;
  onRemove: () => void;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  onAdjustQuantity,
  onRemove,
}) => {
  const { theme } = useTheme();
  const categoryColor = ITEM_CATEGORY_COLORS[item.category];

  const getCategoryIcon = (): string => {
    switch (item.category) {
      case 'potion':
        return 'bottle-tonic';
      case 'tool':
        return 'wrench';
      case 'artifact':
        return 'diamond-stone';
      case 'misc':
        return 'package-variant';
      default:
        return 'package';
    }
  };

  return (
    <View
      style={[
        styles.inventoryItem,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      <MaterialCommunityIcons
        name={getCategoryIcon() as any}
        size={24}
        color={categoryColor}
      />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.itemCategory, { color: categoryColor }]}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
      </View>

      <View style={styles.quantityControls}>
        <Pressable
          style={[
            styles.quantityButton,
            { backgroundColor: theme.colors.danger + '20' },
          ]}
          onPress={() => onAdjustQuantity(-1)}
        >
          <Text style={[styles.quantityButtonText, { color: theme.colors.danger }]}>
            -
          </Text>
        </Pressable>

        <Text style={[styles.quantity, { color: theme.colors.text }]}>
          x{item.quantity}
        </Text>

        <Pressable
          style={[
            styles.quantityButton,
            { backgroundColor: theme.colors.success + '20' },
          ]}
          onPress={() => onAdjustQuantity(1)}
        >
          <Text style={[styles.quantityButtonText, { color: theme.colors.success }]}>
            +
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.removeButton}
        onPress={onRemove}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
      </Pressable>
    </View>
  );
};

export const InventoryList: React.FC = () => {
  const { theme } = useTheme();
  const { hero, addItem, removeItem, updateItemQuantity } = useHero();
  const [showAddModal, setShowAddModal] = useState(false);

  if (!hero) return null;

  const handleAddItem = async (itemId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newItem = createItemInstance(itemId, 1);
    if (newItem) {
      addItem(newItem);
    }
    setShowAddModal(false);
  };

  const handleAdjustQuantity = async (itemId: string, delta: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const item = hero.inventory.find((i) => i.id === itemId);
    if (item) {
      updateItemQuantity(itemId, item.quantity + delta);
    }
  };

  const handleRemove = async (itemId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeItem(itemId);
  };

  // Group items by category for the add modal
  const groupedItems = ITEM_CATEGORIES.map((cat) => ({
    title: cat.label,
    data: ITEM_DEFINITIONS.filter((i) => i.category === cat.value),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          INVENTORY
        </Text>
        <Pressable
          style={[
            styles.addButton,
            { backgroundColor: theme.colors.accent },
          ]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </Pressable>
      </View>

      {hero.inventory.length === 0 ? (
        <View
          style={[
            styles.emptyState,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <MaterialCommunityIcons
            name="package-variant"
            size={40}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            No items in inventory
          </Text>
        </View>
      ) : (
        hero.inventory.map((item) => (
          <InventoryItem
            key={item.id}
            item={item}
            onAdjustQuantity={(delta) => handleAdjustQuantity(item.id, delta)}
            onRemove={() => handleRemove(item.id)}
          />
        ))
      )}

      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
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
                Add Item
              </Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text} />
              </Pressable>
            </View>

            <SectionList
              sections={groupedItems}
              keyExtractor={(item) => item.id}
              renderSectionHeader={({ section }) => (
                <Text
                  style={[
                    styles.sectionHeader,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.text,
                    },
                  ]}
                >
                  {section.title}
                </Text>
              )}
              renderItem={({ item }) => {
                const alreadyHas = hero.inventory.some((i) => i.id === item.id);
                return (
                  <Pressable
                    style={[
                      styles.addItemOption,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => handleAddItem(item.id)}
                  >
                    <View style={styles.addItemInfo}>
                      <Text
                        style={[
                          styles.addItemName,
                          { color: theme.colors.text },
                        ]}
                      >
                        {item.name}
                        {alreadyHas && ' (owned)'}
                      </Text>
                      <Text
                        style={[
                          styles.addItemDesc,
                          { color: theme.colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    </View>
                    <Text
                      style={[styles.addItemGold, { color: theme.colors.gold }]}
                    >
                      {item.goldCost}g
                    </Text>
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
  inventoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemCategory: {
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
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
  addItemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  addItemInfo: {
    flex: 1,
  },
  addItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  addItemDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  addItemGold: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
