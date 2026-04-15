import { QuestPack } from '@/types';
import { Quest } from './types';
import { BASE_QUESTS } from './base';

export type { Quest } from './types';

// Registry of all quest packs — add new expansions here
const QUEST_PACKS: Record<QuestPack, Quest[]> = {
  'base': BASE_QUESTS,
  'kellars-keep': [],
  'return-of-the-witch-lord': [],
  'against-the-ogre-horde': [],
  'mage-of-the-mirror': [],
  'the-frozen-horror': [],
  'rise-of-the-dread-moon': [],
  'the-spirit-queens-torment': [],
  'first-light': [],
  'jungles-of-delthrak': [],
};

// All quests across all packs
export const QUESTS: Quest[] = Object.values(QUEST_PACKS).flat();

// Get quests filtered by active packs
export const getQuestsForPacks = (activePacks: QuestPack[]): Quest[] => {
  return activePacks.flatMap(pack => QUEST_PACKS[pack] || []);
};

export const getQuestById = (id: number): Quest | undefined => {
  return QUESTS.find(q => q.id === id);
};

export const getQuestsByPack = (pack: QuestPack): Quest[] => {
  return QUEST_PACKS[pack] || [];
};
