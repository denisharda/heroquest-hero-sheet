import { QuestPack } from '@/types';

export interface Quest {
  id: number;
  questPack: QuestPack;
  name: string;
  wanderingMonster: string;
  description: string;
  artifact?: string;
  notes?: string;
}
