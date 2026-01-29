import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { useHero } from '@/hooks/useHero';
import * as Haptics from 'expo-haptics';

export const GoldCounter: React.FC = () => {
  const { theme } = useTheme();
  const { hero, setGold, adjustGold } = useHero();
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  if (!hero) return null;

  const handleAdjust = async (delta: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    adjustGold(delta);
  };

  const handleLongPress = () => {
    setInputValue(hero.gold.toString());
    setShowInput(true);
  };

  const handleSave = async () => {
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setGold(value);
    }
    setShowInput(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.header}>
        <FontAwesome5 name="coins" size={20} color={theme.colors.gold} />
        <Text style={[styles.title, { color: theme.colors.text }]}>GOLD</Text>
      </View>

      <View style={styles.counterRow}>
        <Pressable
          style={[
            styles.adjustButton,
            { backgroundColor: theme.colors.danger + '30' },
          ]}
          onPress={() => handleAdjust(-10)}
          onLongPress={() => handleAdjust(-100)}
        >
          <Text style={[styles.adjustText, { color: theme.colors.danger }]}>
            -10
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.adjustButton,
            { backgroundColor: theme.colors.danger + '20' },
          ]}
          onPress={() => handleAdjust(-1)}
        >
          <Text style={[styles.adjustText, { color: theme.colors.danger }]}>
            -1
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.goldDisplay,
            { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
          ]}
          onLongPress={handleLongPress}
        >
          <Text style={[styles.goldValue, { color: '#FFFFFF' }]}>
            {hero.gold}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.adjustButton,
            { backgroundColor: theme.colors.success + '20' },
          ]}
          onPress={() => handleAdjust(1)}
        >
          <Text style={[styles.adjustText, { color: theme.colors.success }]}>
            +1
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.adjustButton,
            { backgroundColor: theme.colors.success + '30' },
          ]}
          onPress={() => handleAdjust(10)}
          onLongPress={() => handleAdjust(100)}
        >
          <Text style={[styles.adjustText, { color: theme.colors.success }]}>
            +10
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
        Long press amount to edit directly • Long press +10/-10 for ±100
      </Text>

      <Modal
        visible={showInput}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInput(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInput(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Set Gold Amount
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
                onPress={() => setShowInput(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: theme.colors.accent },
                ]}
                onPress={handleSave}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjustButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  adjustText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  goldDisplay: {
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  goldValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
