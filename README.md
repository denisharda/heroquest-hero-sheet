# HeroQuest Hero Sheet

A mobile character sheet app for the HeroQuest board game, built with Expo (React Native).

## Features

- **Multiple Heroes**: Create, save, and switch between multiple hero profiles
- **Auto-Calculation**: Equipment bonuses automatically update Attack/Defense stats
- **Visual Health Tracker**: Tap to damage, long-press to heal with haptic feedback
- **Smart Equipment Selection**: Filter weapons by class, warns about 2H weapon + shield conflicts
- **Spell Tracking**: Only shown for Elf/Wizard, organized by elemental school
- **Quest Progress**: Track completion of all 14 quests with visual progress bar
- **Undo/Redo**: Full history tracking with undo/redo support
- **Two Themes**: Fantasy (parchment) and Dark Fantasy themes
- **Auto-Save**: All changes persist automatically via AsyncStorage

## Hero Classes

| Class | Attack | Defense | Body | Mind | Spells |
|-------|--------|---------|------|------|--------|
| Barbarian | 3 | 2 | 8 | 2 | No |
| Dwarf | 2 | 2 | 7 | 3 | No |
| Elf | 2 | 2 | 6 | 4 | Yes (3) |
| Wizard | 1 | 2 | 4 | 6 | Yes (9) |

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x (22+ has compatibility issues with current Expo)
- npm or yarn
- Expo CLI
- iOS Simulator, Android Emulator, or Expo Go app

### Installation

```bash
# Clone the repository
cd heroquest-herosheet

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Project Structure

```
heroquest-herosheet/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Main character sheet screen
│   └── heroes.tsx          # Hero list/switcher modal
├── components/             # UI Components
│   ├── HeroIdentity.tsx    # Name + Class selector
│   ├── StatBlock.tsx       # Attack/Defense/Move stats
│   ├── HealthTracker.tsx   # Body/Mind point tracker
│   ├── EquipmentSelector.tsx # Equipment picker
│   ├── SpellTracker.tsx    # Spell checkboxes
│   ├── GoldCounter.tsx     # Gold +/- counter
│   ├── InventoryList.tsx   # Items management
│   ├── QuestProgress.tsx   # Quest completion badges
│   ├── HeroSwitcher.tsx    # Hero selection modal
│   └── ThemeToggle.tsx     # Theme switcher
├── data/                   # Game data
│   ├── heroes.ts           # Hero class stats
│   ├── weapons.ts          # Weapon definitions
│   ├── armor.ts            # Armor/shield/helmet data
│   ├── spells.ts           # Spell definitions
│   └── items.ts            # Potions & items
├── store/                  # State management
│   ├── heroStore.ts        # Zustand hero state
│   └── themeStore.ts       # Theme preferences
├── theme/                  # Theme system
│   ├── ThemeContext.tsx    # Theme provider
│   ├── fantasy.ts          # Fantasy theme colors
│   └── darkFantasy.ts      # Dark Fantasy theme
├── hooks/                  # Custom hooks
│   ├── useHero.ts          # Hero state helpers
│   └── useUndoRedo.ts      # Undo/redo logic
├── types/                  # TypeScript definitions
│   └── index.ts            # All interfaces
└── constants/              # App constants
    └── colors.ts           # Shared colors
```

## Replacing Placeholder Images

Hero portraits currently use colored circles with class initials. To replace:

1. Add your images to `assets/images/`
2. Update `PlaceholderPortrait.tsx` to use your images
3. Image recommendations:
   - Barbarian: Red-themed warrior
   - Dwarf: Brown-themed dwarf
   - Elf: Green-themed elf
   - Wizard: Blue-themed wizard

## Tech Stack

- **Framework**: Expo SDK 52 + React Native
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand with persist middleware
- **Storage**: AsyncStorage
- **Animations**: React Native Reanimated
- **Haptics**: expo-haptics
- **Icons**: @expo/vector-icons

## License

MIT
