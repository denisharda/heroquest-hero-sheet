export interface Quest {
  id: number;
  name: string;
  wanderingMonster: string;
  description: string;
  artifact?: string;
  notes?: string;
}

export const QUESTS: Quest[] = [
  {
    id: 1,
    name: 'The Trial',
    wanderingMonster: 'Orc',
    description: 'Your first quest as heroes. Prove your worth by navigating this introductory dungeon and defeating the monsters within. This is a test of your abilities before the real challenges begin.',
    notes: 'Introductory quest to learn game mechanics.',
  },
  {
    id: 2,
    name: 'The Rescue of Sir Ragnar',
    wanderingMonster: 'Orc',
    description: 'Sir Ragnar, a noble knight, has been captured by Orcs and is being held prisoner in a dungeon. You must find and rescue him before it is too late.',
    notes: 'Rescue mission - find Sir Ragnar and escort him to safety.',
  },
  {
    id: 3,
    name: 'Lair of the Orc Warlord',
    wanderingMonster: 'Orc',
    description: 'The Orc Warlord Ulag has been terrorizing the countryside. Enter his lair and put an end to his reign of terror once and for all.',
    notes: 'Boss battle against the Orc Warlord Ulag.',
  },
  {
    id: 4,
    name: "Prince Magnus' Gold",
    wanderingMonster: 'Abomination',
    description: 'Prince Magnus hid a treasure of gold coins before his untimely death. The treasure is now guarded by foul creatures. Recover the gold and return it to the Empire.',
    notes: 'Treasure recovery mission. Movement reduced to 1d6 when carrying treasure chest.',
  },
  {
    id: 5,
    name: "Melar's Maze",
    wanderingMonster: 'Zombie',
    description: 'The wizard Melar created a magical maze filled with traps and undead guardians. Somewhere within lies the Talisman of Lore, a powerful magical artifact.',
    artifact: 'Talisman of Lore',
    notes: 'Maze puzzle with undead enemies. Artifact: Talisman of Lore (+1 Mind Point).',
  },
  {
    id: 6,
    name: 'Legacy of the Orc Warlord',
    wanderingMonster: 'Abomination',
    description: "Though Ulag is dead, his legacy lives on. His followers have gathered his remaining treasures and plot revenge. Among them is the Wizard's Cloak.",
    artifact: "Wizard's Cloak",
    notes: "Artifact: Wizard's Cloak (+1 Defense die for Wizard only).",
  },
  {
    id: 7,
    name: 'The Lost Wizard',
    wanderingMonster: 'Mummy',
    description: "A wizard named Dorin went searching for the legendary Borin's Armor and never returned. Find out what happened to him and recover the armor if possible.",
    artifact: "Borin's Armor",
    notes: "Artifact: Borin's Armor (4 Defense dice, no movement penalty, not for Wizard).",
  },
  {
    id: 8,
    name: 'The Fire Mage',
    wanderingMonster: 'Abomination',
    description: 'Balur, a powerful Fire Mage, threatens the land with his destructive magic. Enter his volcanic lair and defeat him. The Wand of Magic awaits those brave enough to claim it.',
    artifact: 'Wand of Magic',
    notes: 'Boss battle against Balur. Artifact: Wand of Magic (cast 2 different spells per turn).',
  },
  {
    id: 9,
    name: 'Race Against Time',
    wanderingMonster: 'Abomination',
    description: 'A deadly plague spreads across the land. The only cure is the Elixir of Life, hidden deep within an ancient tomb. Time is running out.',
    artifact: 'Elixir of Life',
    notes: 'Timed mission. Artifact: Elixir of Life (resurrect dead hero, one use).',
  },
  {
    id: 10,
    name: 'Castle of Mystery',
    wanderingMonster: 'Ghost',
    description: 'A haunted castle holds many secrets and the Ring of Return. Ghosts roam the halls, and reality itself seems unstable within these cursed walls.',
    artifact: 'Ring of Return',
    notes: 'Special wandering monster: Ghost. Artifact: Ring of Return (teleport all visible heroes to start).',
  },
  {
    id: 11,
    name: 'Bastion of Dread',
    wanderingMonster: 'Abomination',
    description: "A fortress of evil stands as the last barrier before the Witch Lord's domain. Within its walls lies Orc's Bane, a sword deadly to greenskins.",
    artifact: "Orc's Bane",
    notes: "Artifact: Orc's Bane (2 attack dice, attack twice against Orcs).",
  },
  {
    id: 12,
    name: 'Barak Tor—Barrow of the Witch Lord',
    wanderingMonster: 'Skeleton',
    description: "The dreaded Witch Lord awaits in his barrow tomb. Only the Spirit Blade can harm him, but it lies elsewhere. This is a reconnaissance mission to learn his weaknesses.",
    artifact: "Wizard's Staff",
    notes: "First encounter with Witch Lord. Artifact: Wizard's Staff (2 attack dice, diagonal attack for Wizard).",
  },
  {
    id: 13,
    name: 'Quest for the Spirit Blade',
    wanderingMonster: 'Dread Warrior',
    description: 'The Spirit Blade is the only weapon that can harm the Witch Lord. It is guarded by powerful Dread Warriors. Claim the blade to prepare for the final battle.',
    artifact: 'Spirit Blade',
    notes: 'Artifact: Spirit Blade (3 attack dice, 4 vs undead, diagonal attack, harms Witch Lord).',
  },
  {
    id: 14,
    name: 'Return to Barak Tor',
    wanderingMonster: 'Mummy',
    description: 'Armed with the Spirit Blade, return to Barak Tor and destroy the Witch Lord once and for all. This is the final quest—the fate of the Empire rests on your shoulders.',
    artifact: 'Spell Ring',
    notes: 'Final battle against the Witch Lord. Artifact: Spell Ring (cast one spell twice per quest).',
  },
];

export const getQuestById = (id: number): Quest | undefined => {
  return QUESTS.find(q => q.id === id);
};
