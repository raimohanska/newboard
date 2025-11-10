import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAwarenessState } from './useAwarenessState';

interface SelectionBox {
  isActive: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const defaultSelectionBox: SelectionBox = {
  isActive: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
};

export function useSelectionBox(): SelectionBox {
  return useAwarenessState<SelectionBox>('selectionBox', defaultSelectionBox);
}

export function useUpdateSelectionBox() {
  const { itemStore } = useWorkspace();

  return {
    startSelectionBox: (x: number, y: number) => {
      const awareness = itemStore.getAwareness();
      if (!awareness) return;
      
      awareness.setLocalStateField('selectionBox', {
        isActive: true,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
      });
    },
    
    updateSelectionBox: (x: number, y: number) => {
      const awareness = itemStore.getAwareness();
      if (!awareness) return;
      
      const current = awareness.getLocalState()?.selectionBox;
      if (!current) return;
      
      awareness.setLocalStateField('selectionBox', {
        ...current,
        endX: x,
        endY: y,
      });
    },
    
    endSelectionBox: () => {
      const awareness = itemStore.getAwareness();
      if (!awareness) return;
      
      awareness.setLocalStateField('selectionBox', {
        isActive: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
      });
    },
  };
}

