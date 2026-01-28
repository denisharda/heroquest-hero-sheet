# HeroQuest Hero Sheet Specification

This document outlines all the information that should be displayed and tracked on a HeroQuest hero sheet.

---

## Hero Classes

HeroQuest features four playable hero classes, each with unique strengths and abilities.

### Base Stats by Class

| Hero      | Body Points | Mind Points | Attack Dice | Defense Dice | Starting Weapon | Movement |
|-----------|-------------|-------------|-------------|--------------|-----------------|----------|
| Barbarian | 8           | 2           | 3           | 2            | Broadsword      | 2d6      |
| Dwarf     | 7           | 3           | 2           | 2            | Shortsword      | 2d6      |
| Elf       | 6           | 4           | 2           | 2            | Shortsword      | 2d6      |
| Wizard    | 4           | 6           | 1           | 2            | Dagger          | 2d6      |

### Class Descriptions

#### Barbarian
- **Strengths:** Highest Body Points (8), highest Attack Dice (3)
- **Weaknesses:** Lowest Mind Points (2), no magical abilities
- **Role:** Front-line fighter, damage dealer
- **Equipment:** Can use all weapons and armor

#### Dwarf
- **Strengths:** High Body Points (7), balanced stats
- **Weaknesses:** Average attack, no magical abilities
- **Role:** Tank, trap specialist
- **Special Ability:** Can disarm traps without a toolkit
- **Equipment:** Can use all weapons and armor

#### Elf
- **Strengths:** Balanced fighter with magic capabilities
- **Weaknesses:** Lower Body Points (6)
- **Role:** Hybrid fighter/spellcaster
- **Special Ability:** Can cast spells from ONE elemental school (3 spells)
- **Equipment:** Can use all weapons and armor

#### Wizard
- **Strengths:** Highest Mind Points (6), most powerful spellcaster
- **Weaknesses:** Lowest Body Points (4), lowest Attack Dice (1)
- **Role:** Support, ranged magical damage
- **Special Ability:** Can cast spells from THREE elemental schools (9 spells total)
- **Equipment:** Cannot use most weapons or armor (Staff and Dagger only)

---

## Core Attributes

### Body Points (BP)
- Represents physical health/hit points
- Damage reduces Body Points
- At 0 Body Points, the hero is defeated
- Fully restored between quests
- Can be increased through certain artifacts or potions

### Mind Points (MP)
- Represents mental fortitude and magical resistance
- Used to resist certain spells and effects
- Higher Mind Points = better magical defense
- Fully restored between quests

### Attack Dice
- Number of combat dice rolled when attacking
- Can be modified by weapons and equipment
- Each skull rolled = 1 hit on the target

### Defense Dice
- Number of combat dice rolled when defending
- Can be modified by armor, shields, and helmets
- Each shield rolled = 1 blocked hit

### Movement
- Determined by rolling 2d6 each turn
- Movement is not mandatory (can move fewer squares)
- Cannot pass through monsters or walls
- Cannot move diagonally through walls or obstacles
- Some armor (Plate Mail) reduces movement to 1d6

---

## Equipment System

### Equipment Slots
- **Primary Hand:** Weapon (or two-handed weapon)
- **Secondary Hand:** Shield (if not using two-handed weapon)
- **Head:** Helmet
- **Body:** Armor
- **Inventory:** Potions, toolkit, artifacts, gold

### Weapons

#### One-Handed Weapons

| Weapon      | Cost  | Attack Bonus | Special                    | Restrictions        |
|-------------|-------|--------------|----------------------------|---------------------|
| Dagger      | 25g   | 1            | Throwable (lost when used) | None                |
| Hatchet     | 50g   | 1            | Throwable                  | Not Wizard          |
| Whip        | 125g  | 1            | -                          | Not Wizard          |
| Shortsword  | 150g  | 2            | -                          | Not Wizard          |
| Axe/Hammer  | 200g  | 2            | Throwable                  | Not Wizard          |
| Flail       | 250g  | 2            | -                          | Not Wizard          |
| Broadsword  | 250g  | 3            | -                          | Not Wizard          |
| Longsword   | 350g  | 3            | -                          | Not Wizard          |

#### Two-Handed Weapons

| Weapon           | Cost  | Attack Bonus | Special                    | Restrictions        |
|------------------|-------|--------------|----------------------------|---------------------|
| Staff            | 100g  | 1            | No shield                  | None                |
| Spear            | 400g  | 2            | 2-square range, no shield  | Not Wizard          |
| Halberd          | 500g  | 3            | 2-square range, no shield  | Not Wizard          |
| Battle Axe       | 450g  | 4            | No shield                  | Not Wizard          |
| Two-Handed Sword | 600g  | 4            | No shield                  | Not Wizard          |

#### Ranged Weapons

| Weapon    | Cost  | Attack Bonus | Special                              | Restrictions |
|-----------|-------|--------------|--------------------------------------|--------------|
| Short Bow | 100g  | 1            | Two-handed, 1 turn to switch weapons | Not Wizard   |
| Long Bow  | 200g  | 2            | Two-handed, 1 turn to switch weapons | Not Wizard   |
| Crossbow  | 300g  | 3            | Two-handed, 1 turn reload            | Not Wizard   |

### Armor

| Armor      | Cost  | Defense Bonus | Special               | Restrictions |
|------------|-------|---------------|-----------------------|--------------|
| Helmet     | 125g  | +1            | -                     | Not Wizard   |
| Chain Mail | 500g  | +1            | -                     | Not Wizard   |
| Plate Mail | 850g  | +2            | Movement reduced to 1d6 | Not Wizard   |

### Shields

| Shield       | Cost  | Defense Bonus | Restrictions                       |
|--------------|-------|---------------|------------------------------------|
| Small Shield | 150g  | +1            | Not Wizard, not with 2H weapons    |
| Large Shield | 300g  | +2            | Not Wizard, not with 2H weapons    |

### Other Items

| Item    | Cost  | Effect                                    |
|---------|-------|-------------------------------------------|
| Toolkit | 250g  | Required to disarm traps (except Dwarf)   |

---

## Spell System

### Spell Distribution
- **Wizard:** Chooses 3 elemental schools (9 spells total)
- **Elf:** Chooses 1 elemental school (3 spells total)
- Spells can only be used ONCE per quest
- Wizard chooses spell schools first, then Elf

### Elemental Spell Schools

#### Air Spells
| Spell       | Effect                                           |
|-------------|--------------------------------------------------|
| Genie       | Summons a Genie to assist the party              |
| Swift Wind  | Adds extra movement or escape assistance         |
| Tempest     | Wind-based area attack                           |

#### Earth Spells
| Spell           | Effect                                       |
|-----------------|----------------------------------------------|
| Heal Body       | Restores Body Points to a hero               |
| Pass Through Rock | Allows movement through walls              |
| Rock Skin       | Increases defense temporarily                |

#### Fire Spells
| Spell          | Effect                                        |
|----------------|-----------------------------------------------|
| Ball of Flame  | Ranged fire attack                            |
| Courage        | Removes fear effects, boosts morale           |
| Fire of Wrath  | Powerful fire attack                          |

#### Water Spells
| Spell            | Effect                                      |
|------------------|---------------------------------------------|
| Sleep            | Puts enemies to sleep                       |
| Veil of Mist     | Creates concealment/protection              |
| Water of Healing | Restores Body Points                        |

### Spell Tracking
The hero sheet should track:
- Which spell schools are available
- Which spells have been used this quest
- Which spells are still available

---

## Treasure & Artifacts

### Treasure Types
- **Gold Coins:** Currency for purchasing equipment
- **Gems:** Valuable items (can be sold)
- **Potions:** Consumable items with various effects
- **Artifacts:** Powerful magical items

### Artifact Cards (10 Total)
| Artifact        | Effect                                          |
|-----------------|-------------------------------------------------|
| Borin's Armor   | Powerful dwarven armor                          |
| Elixir of Life  | Restores hero from death                        |
| Orc's Bane      | Bonus against Orcs                              |
| Ring of Return  | Teleportation ability                           |
| Spell Ring      | Additional spell casting                        |
| Spirit Blade    | Magical weapon                                  |
| Talisman of Lore| Knowledge/wisdom bonus                          |
| Wand of Magic   | Magical attacks                                 |
| Wizard's Cloak  | Magical protection                              |
| Wizard's Staff  | Enhanced magical abilities                      |

### Potions
- **Healing Potion:** Restores Body Points
- **Heroic Brew:** Temporary stat boost
- **Potion of Speed:** Extra movement
- **Potion of Strength:** Extra attack dice

---

## Combat & Actions

### Turn Structure
Each turn, a hero can:
1. **Move** (roll 2d6 for movement points)
2. Perform **ONE action**

### Available Actions (choose one per turn)
- Attack an adjacent monster
- Cast a spell
- Search for treasure
- Open a chest
- Search for traps
- Search for secret doors
- Disarm a trap
- Pass items to adjacent hero (expansion rule)

### Non-Action Activities (can do alongside action)
- Open doors
- Drink potions
- Pick up items from the ground
- Look around

### Combat Resolution
1. Attacker rolls Attack Dice
2. Count skulls = potential hits
3. Defender rolls Defense Dice
4. Count shields = blocked hits
5. Remaining hits = damage to Body Points

---

## Trap System

### Trap Types

| Trap Type     | Damage                           | Special Effect                      |
|---------------|----------------------------------|-------------------------------------|
| Pit Trap      | 1 BP                             | -1 combat die while in pit          |
| Falling Block | Roll 3d6, each skull = 1 BP      | Blocks path permanently             |
| Spear Trap    | Roll 1d6, skull = 1 BP           | Auto-disarms after triggering       |
| Chest Trap    | Variable                         | Triggered when opening trapped chest|

### Trap Disarming
- Requires Toolkit (250g) OR
- Dwarf can disarm without toolkit (special ability)

---

## Hero Sheet Layout Recommendations

### Section 1: Hero Identity
- Hero Name (custom)
- Hero Class
- Player Name
- Portrait/Image

### Section 2: Core Stats
- Body Points (current / maximum)
- Mind Points (current / maximum)
- Attack Dice (base + equipment bonus)
- Defense Dice (base + equipment bonus)
- Movement (2d6 or 1d6 if wearing Plate Mail)

### Section 3: Equipment
- Primary Weapon
- Secondary (Shield or empty)
- Helmet
- Armor
- Inventory slots (for potions, toolkit, artifacts)

### Section 4: Spells (Elf & Wizard only)
- Available spell schools
- Spell list with checkboxes for used/available

### Section 5: Gold & Treasure
- Gold coins total
- Gems collected
- Artifacts owned

### Section 6: Quest Log (optional)
- Quests completed
- Monsters defeated
- Total experience/achievements

---

## Data Model Summary

```
Hero {
  // Identity
  name: string
  class: "Barbarian" | "Dwarf" | "Elf" | "Wizard"
  playerName: string
  portrait: string (optional)

  // Core Stats
  bodyPoints: { current: number, max: number }
  mindPoints: { current: number, max: number }
  baseAttackDice: number
  baseDefenseDice: number

  // Equipment
  weapon: Weapon | null
  shield: Shield | null
  helmet: Helmet | null
  armor: Armor | null
  inventory: Item[]

  // Spells (Elf/Wizard only)
  spellSchools: SpellSchool[]
  spells: Spell[]
  usedSpells: Spell[]

  // Resources
  gold: number
  artifacts: Artifact[]

  // Progression (optional)
  questsCompleted: number
  monstersDefeated: number
}
```

---

## Sources

- [HeroQuest Interactive Wiki - Rules Guide](https://heroquest.fandom.com/wiki/Guide:Rules)
- [Ye Olde Inn - Armory](https://aginsinn.yeoldeinn.com/armory.html)
- [HeroScribe - Main Game](https://www.heroscribe.org/baloban/MainGame.htm)
- [BoardGameGeek - HeroQuest Character Sheets](https://boardgamegeek.com/filepage/154281/heroquest-character-sheets)
- [Ye Olde Inn - Design Tools](https://english.yeoldeinn.com/design-tools.php)
- [HeroQuest Wikipedia](https://en.wikipedia.org/wiki/HeroQuest)
