import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface SelectionBox {
  isActive: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface UserSelectionBox {
  clientId: number;
  isLocal: boolean;
  color: string;
  selectionBox: SelectionBox;
}

export function useAllSelectionBoxes(): UserSelectionBox[] {
  const { itemStore } = useWorkspace();
  const [boxes, setBoxes] = useState<UserSelectionBox[]>([]);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setBoxes([]);
      return;
    }

    const updateBoxes = () => {
      const states = awareness.getStates();
      const result: UserSelectionBox[] = [];

      states.forEach((state, clientId) => {
        const selectionBox = state.selectionBox;
        if (selectionBox?.isActive) {
          result.push({
            clientId,
            isLocal: clientId === awareness.clientID,
            color: state.user?.color || '#4a90e2',
            selectionBox,
          });
        }
      });

      setBoxes(result);
    };

    updateBoxes();
    awareness.on('change', updateBoxes);

    return () => {
      awareness.off('change', updateBoxes);
    };
  }, [itemStore]);

  return boxes;
}

