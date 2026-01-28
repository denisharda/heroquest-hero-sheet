import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/theme/ThemeContext';
import { useHeroList } from '@/hooks/useHero';
import { HERO_CLASSES, HERO_CLASS_NAMES } from '@/data/heroes';
import { SPELL_SCHOOLS, getSpellsForSchool } from '@/data/spells';
import { HeroClassName, SpellSchool } from '@/types';
import * as Haptics from 'expo-haptics';

// Spell school colors
const SCHOOL_COLORS: Record<SpellSchool, string> = {
  Air: '#87CEEB',
  Earth: '#8B4513',
  Fire: '#FF4500',
  Water: '#4169E1',
};

// Spell school icons
const SCHOOL_ICONS: Record<SpellSchool, string> = {
  Air: 'weather-windy',
  Earth: 'mountain',
  Fire: 'fire',
  Water: 'water',
};

interface HeroSwitcherProps {
  visible: boolean;
  onClose: () => void;
}

type CreationStep = 'class' | 'spells' | 'confirm';

export const HeroSwitcher: React.FC<HeroSwitcherProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { heroes, currentHeroId, selectHero, createHero, deleteHero } = useHeroList();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creationStep, setCreationStep] = useState<CreationStep>('class');
  const [newHeroName, setNewHeroName] = useState('');
  const [selectedClass, setSelectedClass] = useState<HeroClassName>('Barbarian');
  const [selectedSchools, setSelectedSchools] = useState<SpellSchool[]>([]);

  // Reset form when closing
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setShowCreateForm(false);
    setCreationStep('class');
    setNewHeroName('');
    setSelectedClass('Barbarian');
    setSelectedSchools([]);
  };

  const handleSelectHero = async (heroId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    selectHero(heroId);
    onClose();
  };

  const getRequiredSchoolCount = (heroClass: HeroClassName): number => {
    if (heroClass === 'Elf') return 1;
    if (heroClass === 'Wizard') return 3;
    return 0;
  };

  const needsSpellSelection = (heroClass: HeroClassName): boolean => {
    return heroClass === 'Elf' || heroClass === 'Wizard';
  };

  const handleClassSelect = async (className: HeroClassName) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedClass(className);
    setSelectedSchools([]);
  };

  const handleSchoolToggle = async (school: SpellSchool) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const requiredCount = getRequiredSchoolCount(selectedClass);

    if (selectedSchools.includes(school)) {
      // Remove school
      setSelectedSchools(selectedSchools.filter(s => s !== school));
    } else {
      // Add school if under limit
      if (selectedSchools.length < requiredCount) {
        setSelectedSchools([...selectedSchools, school]);
      } else {
        // Replace last selection if at limit
        const newSchools = [...selectedSchools];
        newSchools[newSchools.length - 1] = school;
        setSelectedSchools(newSchools);
      }
    }
  };

  const handleNextStep = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (creationStep === 'class') {
      if (!newHeroName.trim()) {
        Alert.alert('Error', 'Please enter a hero name');
        return;
      }
      if (needsSpellSelection(selectedClass)) {
        setCreationStep('spells');
      } else {
        // Non-caster, go straight to create
        handleCreateHero();
      }
    } else if (creationStep === 'spells') {
      const requiredCount = getRequiredSchoolCount(selectedClass);
      if (selectedSchools.length !== requiredCount) {
        Alert.alert('Error', `Please select ${requiredCount} spell school${requiredCount > 1 ? 's' : ''}`);
        return;
      }
      handleCreateHero();
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (creationStep === 'spells') {
      setCreationStep('class');
    } else {
      setShowCreateForm(false);
    }
  };

  const handleCreateHero = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createHero(newHeroName.trim(), selectedClass, selectedSchools);
    resetForm();
    onClose();
  };

  const handleDeleteHero = (heroId: string, heroName: string) => {
    Alert.alert(
      'Delete Hero',
      `Are you sure you want to delete ${heroName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteHero(heroId);
          },
        },
      ]
    );
  };

  const renderClassSelection = () => (
    <View style={styles.createForm}>
      <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
        Hero Name
      </Text>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        value={newHeroName}
        onChangeText={setNewHeroName}
        placeholder="Enter hero name"
        placeholderTextColor={theme.colors.textSecondary}
        autoFocus
      />

      <Text
        style={[
          styles.inputLabel,
          { color: theme.colors.textSecondary, marginTop: 16 },
        ]}
      >
        Class
      </Text>
      <View style={styles.classOptions}>
        {HERO_CLASS_NAMES.map((className) => {
          const classData = HERO_CLASSES[className];
          const isSelected = className === selectedClass;
          return (
            <Pressable
              key={className}
              style={[
                styles.classOption,
                {
                  backgroundColor: isSelected
                    ? classData.portraitColor + '30'
                    : theme.colors.surface,
                  borderColor: isSelected
                    ? classData.portraitColor
                    : theme.colors.border,
                },
              ]}
              onPress={() => handleClassSelect(className)}
            >
              <View
                style={[
                  styles.classIcon,
                  { backgroundColor: classData.portraitColor },
                ]}
              >
                <Text style={styles.classIconText}>
                  {classData.portraitInitial}
                </Text>
              </View>
              <Text
                style={[
                  styles.classOptionText,
                  { color: theme.colors.text },
                ]}
              >
                {className}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={20} color={classData.portraitColor} />
              )}
            </Pressable>
          );
        })}
      </View>

      {needsSpellSelection(selectedClass) && (
        <Text style={[styles.spellHint, { color: theme.colors.textSecondary }]}>
          {selectedClass === 'Elf'
            ? 'Elf selects 1 spell school (3 spells)'
            : 'Wizard selects 3 spell schools (9 spells)'}
        </Text>
      )}

      <View style={styles.formButtons}>
        <Pressable
          style={[
            styles.formButton,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          onPress={handleBack}
        >
          <Text style={[styles.formButtonText, { color: theme.colors.text }]}>
            Cancel
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.formButton,
            { backgroundColor: theme.colors.accent },
          ]}
          onPress={handleNextStep}
        >
          <Text style={[styles.formButtonText, { color: '#FFFFFF' }]}>
            {needsSpellSelection(selectedClass) ? 'Next' : 'Create Hero'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderSpellSelection = () => {
    const requiredCount = getRequiredSchoolCount(selectedClass);
    const classData = HERO_CLASSES[selectedClass];

    return (
      <ScrollView style={styles.createForm}>
        <View style={styles.spellHeader}>
          <View
            style={[
              styles.spellHeaderIcon,
              { backgroundColor: classData.portraitColor },
            ]}
          >
            <Text style={styles.spellHeaderIconText}>
              {classData.portraitInitial}
            </Text>
          </View>
          <View style={styles.spellHeaderInfo}>
            <Text style={[styles.spellHeaderName, { color: theme.colors.text }]}>
              {newHeroName}
            </Text>
            <Text style={[styles.spellHeaderClass, { color: theme.colors.textSecondary }]}>
              {selectedClass}
            </Text>
          </View>
        </View>

        <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
          Select {requiredCount} Spell School{requiredCount > 1 ? 's' : ''} ({selectedSchools.length}/{requiredCount})
        </Text>

        <View style={styles.schoolOptions}>
          {SPELL_SCHOOLS.map((school) => {
            const isSelected = selectedSchools.includes(school);
            const spells = getSpellsForSchool(school);
            const schoolColor = SCHOOL_COLORS[school];

            return (
              <Pressable
                key={school}
                style={[
                  styles.schoolOption,
                  {
                    backgroundColor: isSelected
                      ? schoolColor + '30'
                      : theme.colors.surface,
                    borderColor: isSelected ? schoolColor : theme.colors.border,
                  },
                ]}
                onPress={() => handleSchoolToggle(school)}
              >
                <View style={styles.schoolHeader}>
                  <MaterialCommunityIcons
                    name={SCHOOL_ICONS[school] as any}
                    size={28}
                    color={schoolColor}
                  />
                  <Text style={[styles.schoolName, { color: theme.colors.text }]}>
                    {school}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={schoolColor} />
                  )}
                </View>
                <View style={styles.schoolSpells}>
                  {spells.map((spell) => (
                    <Text
                      key={spell.id}
                      style={[styles.spellName, { color: theme.colors.textSecondary }]}
                    >
                      • {spell.name}
                    </Text>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.formButtons, { marginBottom: 20 }]}>
          <Pressable
            style={[
              styles.formButton,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            onPress={handleBack}
          >
            <Text style={[styles.formButtonText, { color: theme.colors.text }]}>
              Back
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.formButton,
              {
                backgroundColor:
                  selectedSchools.length === requiredCount
                    ? theme.colors.accent
                    : theme.colors.surfaceVariant,
              },
            ]}
            onPress={handleNextStep}
            disabled={selectedSchools.length !== requiredCount}
          >
            <Text
              style={[
                styles.formButtonText,
                {
                  color:
                    selectedSchools.length === requiredCount
                      ? '#FFFFFF'
                      : theme.colors.textSecondary,
                },
              ]}
            >
              Create Hero
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
              {showCreateForm
                ? creationStep === 'spells'
                  ? 'Choose Spell Schools'
                  : 'Create New Hero'
                : 'Your Heroes'}
            </Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </Pressable>
          </View>

          {showCreateForm ? (
            creationStep === 'spells' ? (
              renderSpellSelection()
            ) : (
              renderClassSelection()
            )
          ) : (
            <>
              {heroes.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="sword-cross"
                    size={60}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[styles.emptyText, { color: theme.colors.textSecondary }]}
                  >
                    No heroes yet
                  </Text>
                  <Text
                    style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}
                  >
                    Create your first hero to begin your quest!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={heroes}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const classData = HERO_CLASSES[item.heroClass];
                    const isSelected = item.id === currentHeroId;
                    return (
                      <Pressable
                        style={[
                          styles.heroItem,
                          {
                            backgroundColor: isSelected
                              ? theme.colors.accent + '20'
                              : theme.colors.surface,
                            borderColor: isSelected
                              ? theme.colors.accent
                              : theme.colors.border,
                          },
                        ]}
                        onPress={() => handleSelectHero(item.id)}
                      >
                        <View
                          style={[
                            styles.heroPortrait,
                            { backgroundColor: classData.portraitColor },
                          ]}
                        >
                          <Text style={styles.heroPortraitText}>
                            {classData.portraitInitial}
                          </Text>
                        </View>
                        <View style={styles.heroInfo}>
                          <Text
                            style={[styles.heroName, { color: theme.colors.text }]}
                          >
                            {item.name || 'Unnamed Hero'}
                          </Text>
                          <Text
                            style={[
                              styles.heroClass,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {item.heroClass} • {item.questsCompleted.length}/14 Quests
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={theme.colors.accent}
                          />
                        )}
                        <Pressable
                          style={styles.deleteButton}
                          onPress={() => handleDeleteHero(item.id, item.name)}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={theme.colors.danger}
                          />
                        </Pressable>
                      </Pressable>
                    );
                  }}
                />
              )}

              <Pressable
                style={[
                  styles.createButton,
                  { backgroundColor: theme.colors.accent },
                ]}
                onPress={() => setShowCreateForm(true)}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create New Hero</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
  },
  modalContent: {
    maxHeight: '85%',
    borderRadius: 20,
    marginHorizontal: 16,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  heroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
  },
  heroPortrait: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPortraitText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  heroInfo: {
    flex: 1,
    marginLeft: 12,
  },
  heroName: {
    fontSize: 16,
    fontWeight: '600',
  },
  heroClass: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createForm: {
    paddingVertical: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textInput: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  classOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  classIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  classIconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  classOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  spellHint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  spellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  spellHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spellHeaderIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  spellHeaderInfo: {
    marginLeft: 12,
  },
  spellHeaderName: {
    fontSize: 18,
    fontWeight: '600',
  },
  spellHeaderClass: {
    fontSize: 14,
    marginTop: 2,
  },
  schoolOptions: {
    gap: 12,
  },
  schoolOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  schoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  schoolSpells: {
    marginLeft: 40,
  },
  spellName: {
    fontSize: 14,
    marginTop: 4,
  },
});
