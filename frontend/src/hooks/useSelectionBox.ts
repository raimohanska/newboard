import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface SelectionBox {
  isActive: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function useSelectionBox(): SelectionBox {
  const { itemStore } = useWorkspace();
  const [selectionBox, setSelectionBox] = useState<SelectionBox>({
    isActive: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;

    const updateSelectionBox = () => {
      const localState = awareness.getLocalState();
      setSelectionBox(localState?.selectionBox || {
        isActive: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
      });
    };

    updateSelectionBox();
    awareness.on('change', updateSelectionBox);

    return () => {
      awareness.off('change', updateSelectionBox);
    };
  }, [itemStore]);

  return selectionBox;
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

