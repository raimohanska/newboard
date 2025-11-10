import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function useIsEditedByOthers(itemId: string): boolean {
  const { itemStore } = useWorkspace();
  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setIsEdited(false);
      return;
    }

    const checkEditing = () => {
      const states = awareness.getStates();
      let foundEditing = false;

      states.forEach((state, clientId) => {
        // Skip local client
        if (clientId === awareness.clientID) return;

        if (state.editingId === itemId) {
          foundEditing = true;
        }
      });

      setIsEdited(foundEditing);
    };

    checkEditing();
    awareness.on('change', checkEditing);

    return () => {
      awareness.off('change', checkEditing);
    };
  }, [itemId, itemStore]);

  return isEdited;
}

