import { useHeroStore } from '@/store/heroStore';
import * as Haptics from 'expo-haptics';

export const useUndoRedo = () => {
  const undo = useHeroStore((state) => state.undo);
  const redo = useHeroStore((state) => state.redo);
  const canUndo = useHeroStore((state) => state.canUndo);
  const canRedo = useHeroStore((state) => state.canRedo);

  const handleUndo = async () => {
    if (canUndo()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      undo();
    }
  };

  const handleRedo = async () => {
    if (canRedo()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      redo();
    }
  };

  return {
    undo: handleUndo,
    redo: handleRedo,
    canUndo: canUndo(),
    canRedo: canRedo(),
  };
};
