import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface DragOffset {
  x: number;
  y: number;
}

export function useOthersDragOffset(itemId: string): DragOffset | null {
  const { itemStore } = useWorkspace();
  const [offset, setOffset] = useState<DragOffset | null>(null);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setOffset(null);
      return;
    }

    const checkDragOffset = () => {
      const states = awareness.getStates();
      let foundOffset: DragOffset | null = null;

      states.forEach((state, clientId) => {
        // Skip local client
        if (clientId === awareness.clientID) return;

        // Check if this client is dragging our item
        const selectedNoteIds = state.selectedNoteIds || [];
        const dragOffset = state.dragOffset;

        if (selectedNoteIds.includes(itemId) && dragOffset) {
          foundOffset = dragOffset;
        }
      });

      setOffset(foundOffset);
    };

    // Initial check
    checkDragOffset();

    // Listen for changes
    awareness.on('change', checkDragOffset);

    return () => {
      awareness.off('change', checkDragOffset);
    };
  }, [itemId, itemStore]);

  return offset;
}

