import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Hero, HeroClassName, Equipment, Spell, Item, HistoryEntry, Weapon, Shield, Helmet, Armor, SpellSchool } from '@/types';
import { HERO_CLASSES } from '@/data/heroes';
import { createSpellsFromSchools } from '@/data/spells';
import { getStartingWeapon } from '@/data/weapons';

const MAX_HISTORY_SIZE = 50;

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a new hero with default values
// spellSchools: For Elf (1 school), for Wizard (3 schools), empty for Barbarian/Dwarf
const createNewHero = (name: string, heroClass: HeroClassName, spellSchools: SpellSchool[] = []): Hero => {
  const classStats = HERO_CLASSES[heroClass];

  // Create spells from selected schools (empty array for non-casters)
  const spells = classStats.canCastSpells
    ? createSpellsFromSchools(spellSchools)
    : [];

  // Get starting weapon based on class
  const startingWeapon = getStartingWeapon(heroClass);

  return {
    id: generateId(),
    name,
    heroClass,
    currentBodyPoints: classStats.bodyPoints,
    currentMindPoints: classStats.mindPoints,
    equipment: {
      weapon: startingWeapon,
      shield: null,
      helmet: null,
      armor: null,
    },
    spells,
    gold: 0,
    inventory: [],
    questsCompleted: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

interface HeroStore {
  // Heroes list
  heroes: Hero[];
  currentHeroId: string | null;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;

  // Actions - Hero Management
  createHero: (name: string, heroClass: HeroClassName, spellSchools?: SpellSchool[]) => void;
  deleteHero: (heroId: string) => void;
  selectHero: (heroId: string) => void;
  updateHeroName: (name: string) => void;

  // Actions - Stats
  setBodyPoints: (points: number) => void;
  adjustBodyPoints: (delta: number) => void;
  setMindPoints: (points: number) => void;
  adjustMindPoints: (delta: number) => void;

  // Actions - Equipment
  equipWeapon: (weapon: Weapon | null) => void;
  equipShield: (shield: Shield | null) => void;
  equipHelmet: (helmet: Helmet | null) => void;
  equipArmor: (armor: Armor | null) => void;

  // Actions - Spells
  toggleSpellUsed: (spellId: string) => void;
  resetAllSpells: () => void;

  // Actions - Gold
  setGold: (amount: number) => void;
  adjustGold: (delta: number) => void;

  // Actions - Inventory
  addItem: (item: Item) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;

  // Actions - Quests
  toggleQuestCompleted: (questNumber: number) => void;

  // Actions - Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Helpers
  getCurrentHero: () => Hero | null;
}

// Helper to save history
const saveToHistory = (
  hero: Hero,
  action: string,
  history: HistoryEntry[],
  historyIndex: number
): { history: HistoryEntry[]; historyIndex: number } => {
  // Remove any future history if we're not at the end
  const newHistory = history.slice(0, historyIndex + 1);

  // Add new entry
  newHistory.push({
    hero: JSON.parse(JSON.stringify(hero)),
    timestamp: Date.now(),
    action,
  });

  // Trim history if too long
  if (newHistory.length > MAX_HISTORY_SIZE) {
    newHistory.shift();
  }

  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
};

export const useHeroStore = create<HeroStore>()(
  persist(
    (set, get) => ({
      heroes: [],
      currentHeroId: null,
      history: [],
      historyIndex: -1,

      // Hero Management
      createHero: (name, heroClass, spellSchools = []) => {
        const newHero = createNewHero(name, heroClass, spellSchools);
        set((state) => ({
          heroes: [...state.heroes, newHero],
          currentHeroId: newHero.id,
          history: [],
          historyIndex: -1,
        }));
      },

      deleteHero: (heroId) => {
        set((state) => {
          const newHeroes = state.heroes.filter((h) => h.id !== heroId);
          const newCurrentId = state.currentHeroId === heroId
            ? (newHeroes.length > 0 ? newHeroes[0].id : null)
            : state.currentHeroId;
          return {
            heroes: newHeroes,
            currentHeroId: newCurrentId,
            history: newCurrentId !== state.currentHeroId ? [] : state.history,
            historyIndex: newCurrentId !== state.currentHeroId ? -1 : state.historyIndex,
          };
        });
      },

      selectHero: (heroId) => {
        set({
          currentHeroId: heroId,
          history: [],
          historyIndex: -1,
        });
      },

      updateHeroName: (name) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const updatedHero = {
          ...heroes[heroIndex],
          name,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(heroes[heroIndex], 'updateName', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      // Stats
      setBodyPoints: (points) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];
        const classStats = HERO_CLASSES[oldHero.heroClass];
        const clampedPoints = Math.max(0, Math.min(points, classStats.bodyPoints));

        const updatedHero = {
          ...oldHero,
          currentBodyPoints: clampedPoints,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'setBodyPoints', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      adjustBodyPoints: (delta) => {
        const hero = get().getCurrentHero();
        if (!hero) return;
        const classStats = HERO_CLASSES[hero.heroClass];
        const newPoints = Math.max(0, Math.min(hero.currentBodyPoints + delta, classStats.bodyPoints));
        get().setBodyPoints(newPoints);
      },

      setMindPoints: (points) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];
        const classStats = HERO_CLASSES[oldHero.heroClass];
        const clampedPoints = Math.max(0, Math.min(points, classStats.mindPoints));

        const updatedHero = {
          ...oldHero,
          currentMindPoints: clampedPoints,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'setMindPoints', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      adjustMindPoints: (delta) => {
        const hero = get().getCurrentHero();
        if (!hero) return;
        const classStats = HERO_CLASSES[hero.heroClass];
        const newPoints = Math.max(0, Math.min(hero.currentMindPoints + delta, classStats.mindPoints));
        get().setMindPoints(newPoints);
      },

      // Equipment
      equipWeapon: (weapon) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];

        // If equipping a two-handed weapon, unequip shield
        const shouldUnequipShield = weapon?.twoHanded ?? false;

        const updatedHero = {
          ...oldHero,
          equipment: {
            ...oldHero.equipment,
            weapon,
            shield: shouldUnequipShield ? null : oldHero.equipment.shield,
          },
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'equipWeapon', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      equipShield: (shield) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];

        // Can't equip shield if using two-handed weapon
        if (shield && oldHero.equipment.weapon?.twoHanded) {
          return;
        }

        const updatedHero = {
          ...oldHero,
          equipment: {
            ...oldHero.equipment,
            shield,
          },
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'equipShield', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      equipHelmet: (helmet) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];

        const updatedHero = {
          ...oldHero,
          equipment: {
            ...oldHero.equipment,
            helmet,
          },
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'equipHelmet', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      equipArmor: (armor) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];

        const updatedHero = {
          ...oldHero,
          equipment: {
            ...oldHero.equipment,
            armor,
          },
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'equipArmor', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      // Spells
      toggleSpellUsed: (spellId) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];
        const spellIndex = oldHero.spells.findIndex((s) => s.id === spellId);
        if (spellIndex === -1) return;

        const newSpells = [...oldHero.spells];
        newSpells[spellIndex] = {
          ...newSpells[spellIndex],
          used: !newSpells[spellIndex].used,
        };

        const updatedHero = {
          ...oldHero,
          spells: newSpells,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'toggleSpell', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      resetAllSpells: () => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];
        const newSpells = oldHero.spells.map((s) => ({ ...s, used: false }));

        const updatedHero = {
          ...oldHero,
          spells: newSpells,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'resetSpells', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      // Gold
      setGold: (amount) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];
        const clampedAmount = Math.max(0, amount);

        const updatedHero = {
          ...oldHero,
          gold: clampedAmount,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'setGold', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      adjustGold: (delta) => {
        const hero = get().getCurrentHero();
        if (!hero) return;
        get().setGold(hero.gold + delta);
      },

      // Inventory
      addItem: (item) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];

        // Check if item already exists, if so increase quantity
        const existingIndex = oldHero.inventory.findIndex((i) => i.id === item.id);
        let newInventory: Item[];

        if (existingIndex !== -1) {
          newInventory = [...oldHero.inventory];
          newInventory[existingIndex] = {
            ...newInventory[existingIndex],
            quantity: newInventory[existingIndex].quantity + item.quantity,
          };
        } else {
          newInventory = [...oldHero.inventory, item];
        }

        const updatedHero = {
          ...oldHero,
          inventory: newInventory,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'addItem', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      removeItem: (itemId) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];
        const newInventory = oldHero.inventory.filter((i) => i.id !== itemId);

        const updatedHero = {
          ...oldHero,
          inventory: newInventory,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'removeItem', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      updateItemQuantity: (itemId, quantity) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];

        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const itemIndex = oldHero.inventory.findIndex((i) => i.id === itemId);
        if (itemIndex === -1) return;

        const newInventory = [...oldHero.inventory];
        newInventory[itemIndex] = {
          ...newInventory[itemIndex],
          quantity,
        };

        const updatedHero = {
          ...oldHero,
          inventory: newInventory,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'updateItemQuantity', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      // Quests
      toggleQuestCompleted: (questNumber) => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const oldHero = heroes[heroIndex];
        const isCompleted = oldHero.questsCompleted.includes(questNumber);

        const newQuestsCompleted = isCompleted
          ? oldHero.questsCompleted.filter((q) => q !== questNumber)
          : [...oldHero.questsCompleted, questNumber].sort((a, b) => a - b);

        const updatedHero = {
          ...oldHero,
          questsCompleted: newQuestsCompleted,
          updatedAt: Date.now(),
        };

        const newHistory = saveToHistory(oldHero, 'toggleQuest', history, historyIndex);
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = updatedHero;

        set({
          heroes: newHeroes,
          ...newHistory,
        });
      },

      // Undo/Redo
      undo: () => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId || historyIndex < 0) return;

        const previousState = history[historyIndex];
        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const newHeroes = [...heroes];
        newHeroes[heroIndex] = previousState.hero;

        set({
          heroes: newHeroes,
          historyIndex: historyIndex - 1,
        });
      },

      redo: () => {
        const { currentHeroId, heroes, history, historyIndex } = get();
        if (!currentHeroId || historyIndex >= history.length - 1) return;

        const nextState = history[historyIndex + 2];
        if (!nextState) return;

        const heroIndex = heroes.findIndex((h) => h.id === currentHeroId);
        if (heroIndex === -1) return;

        const newHeroes = [...heroes];
        newHeroes[heroIndex] = nextState.hero;

        set({
          heroes: newHeroes,
          historyIndex: historyIndex + 1,
        });
      },

      canUndo: () => {
        return get().historyIndex >= 0;
      },

      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },

      // Helpers
      getCurrentHero: () => {
        const { heroes, currentHeroId } = get();
        if (!currentHeroId) return null;
        return heroes.find((h) => h.id === currentHeroId) || null;
      },
    }),
    {
      name: 'heroquest-heroes',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        heroes: state.heroes,
        currentHeroId: state.currentHeroId,
      }),
    }
  )
);
