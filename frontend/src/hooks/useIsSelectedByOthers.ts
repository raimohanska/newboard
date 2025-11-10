import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

type Color = string

export function useIsSelectedByOthers(itemId: string): Color | null {
  const { itemStore } = useWorkspace();
  const [selection, setSelection] = useState<Color | null>(null);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setSelection(null);
      return;
    }

    const checkSelection = () => {
      const states = awareness.getStates();
      let foundColor: string | null = null;

      states.forEach((state, clientId) => {
        // Skip local client
        if (clientId === awareness.clientID) return;

        const selectedNoteIds = state.selectedNoteIds || [];
        if (selectedNoteIds.includes(itemId)) {
          foundColor = state.user?.color || null;
        }
      });

      setSelection(foundColor);
    };

    checkSelection();
    awareness.on('change', checkSelection);

    return () => {
      awareness.off('change', checkSelection);
    };
  }, [itemId, itemStore]);

  return selection;
}
