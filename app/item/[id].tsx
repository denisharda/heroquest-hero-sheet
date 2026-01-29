import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import { ITEM_CATEGORY_COLORS } from '@/constants/colors';
import { ItemCategory } from '@/types';
import * as Haptics from 'expo-haptics';

const CATEGORY_ICONS: Record<ItemCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
  potion: 'bottle-tonic',
  tool: 'wrench',
  artifact: 'diamond-stone',
  misc: 'package-variant',
};

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  potion: 'Potion',
  tool: 'Tool',
  artifact: 'Artifact',
  misc: 'Miscellaneous',
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { hero, updateItemQuantity, removeItem } = useHero();
  const insets = useSafeAreaInsets();

  const item = hero?.inventory.find((i) => i.id === id);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Item not found
        </Text>
      </View>
    );
  }

  const categoryColor = ITEM_CATEGORY_COLORS[item.category];
  const categoryIcon = CATEGORY_ICONS[item.category];
  const categoryLabel = CATEGORY_LABELS[item.category];

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAdjustQuantity = async (delta: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeItem(item.id);
      router.back();
    } else {
      updateItemQuantity(item.id, newQuantity);
    }
  };

  const handleUseItem = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (item.quantity <= 1) {
      removeItem(item.id);
      router.back();
    } else {
      updateItemQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    removeItem(item.id);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleBack}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Item Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: categoryColor,
            },
          ]}
        >
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <MaterialCommunityIcons
              name={categoryIcon}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
          </View>

          {/* Item Name */}
          <Text style={[styles.itemName, { color: theme.colors.text }]}>
            {item.name}
          </Text>

          {/* Quantity Display */}
          <View style={[styles.quantityDisplay, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.quantityLabel, { color: theme.colors.textSecondary }]}>
              QUANTITY
            </Text>
            <View style={styles.quantityControls}>
              <Pressable
                style={[
                  styles.quantityButton,
                  { backgroundColor: theme.colors.danger + '20' },
                ]}
                onPress={() => handleAdjustQuantity(-1)}
              >
                <Text style={[styles.quantityButtonText, { color: theme.colors.danger }]}>
                  -
                </Text>
              </Pressable>
              <Text style={[styles.quantityValue, { color: theme.colors.text }]}>
                {item.quantity}
              </Text>
              <Pressable
                style={[
                  styles.quantityButton,
                  { backgroundColor: theme.colors.success + '20' },
                ]}
                onPress={() => handleAdjustQuantity(1)}
              >
                <Text style={[styles.quantityButtonText, { color: theme.colors.success }]}>
                  +
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: categoryColor + '40' }]} />

          {/* Description */}
          <Text style={[styles.descriptionLabel, { color: theme.colors.textSecondary }]}>
            DESCRIPTION
          </Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {item.description}
          </Text>

          {/* Gold Cost (if applicable) */}
          {item.goldCost > 0 && (
            <View style={[styles.goldBox, { backgroundColor: theme.colors.gold + '20' }]}>
              <MaterialCommunityIcons
                name="gold"
                size={20}
                color={theme.colors.gold}
              />
              <Text style={[styles.goldText, { color: theme.colors.gold }]}>
                Shop Price: {item.goldCost} gold
              </Text>
            </View>
          )}

          {/* Artifact Note */}
          {item.category === 'artifact' && (
            <View style={[styles.rulesBox, { backgroundColor: theme.colors.background }]}>
              <MaterialCommunityIcons
                name="star"
                size={18}
                color={categoryColor}
              />
              <Text style={[styles.rulesText, { color: theme.colors.textSecondary }]}>
                Artifacts are powerful items found during quests. They cannot be purchased from the armory.
              </Text>
            </View>
          )}

          {/* Potion Note */}
          {item.category === 'potion' && (
            <View style={[styles.rulesBox, { backgroundColor: theme.colors.background }]}>
              <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.rulesText, { color: theme.colors.textSecondary }]}>
                Potions can be drunk at any time (not an action). You can drink multiple potions at once.
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {item.category === 'potion' && (
          <Pressable
            style={[
              styles.useButton,
              {
                backgroundColor: theme.colors.success + '20',
                borderColor: theme.colors.success,
              },
            ]}
            onPress={handleUseItem}
          >
            <MaterialCommunityIcons
              name="bottle-tonic"
              size={24}
              color={theme.colors.success}
            />
            <Text style={[styles.useButtonText, { color: theme.colors.success }]}>
              Use Potion
            </Text>
          </Pressable>
        )}

        <Pressable
          style={[
            styles.removeButton,
            {
              backgroundColor: theme.colors.danger + '20',
              borderColor: theme.colors.danger,
            },
          ]}
          onPress={handleRemove}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={24}
            color={theme.colors.danger}
          />
          <Text style={[styles.removeButtonText, { color: theme.colors.danger }]}>
            Remove from Inventory
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  card: {
    borderRadius: 16,
    borderWidth: 3,
    padding: 20,
    marginBottom: 20,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 16,
  },
  quantityDisplay: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  quantityLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 24,
    minWidth: 50,
    textAlign: 'center',
  },
  divider: {
    height: 2,
    marginVertical: 16,
    borderRadius: 1,
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  goldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
  },
  goldText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rulesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  rulesText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 10,
    marginBottom: 12,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    gap: 10,
  },
  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
