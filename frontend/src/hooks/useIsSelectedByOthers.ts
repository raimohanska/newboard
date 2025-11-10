import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface OthersSelection {
  isSelected: boolean;
  color: string | null;
}

export function useIsSelectedByOthers(itemId: string): OthersSelection {
  const { itemStore } = useWorkspace();
  const [selection, setSelection] = useState<OthersSelection>({ isSelected: false, color: null });

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setSelection({ isSelected: false, color: null });
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

      setSelection({
        isSelected: foundColor !== null,
        color: foundColor,
      });
    };

    checkSelection();
    awareness.on('change', checkSelection);

    return () => {
      awareness.off('change', checkSelection);
    };
  }, [itemId, itemStore]);

  return selection;
}
