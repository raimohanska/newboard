import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function useIsOthersEditing(noteId: string): boolean {
  const { itemStore } = useWorkspace();
  const [isOthersEditing, setIsOthersEditing] = useState(false);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setIsOthersEditing(false);
      return;
    }

    const checkIfOthersEditing = () => {
      const states = awareness.getStates();
      let othersEditing = false;

      states.forEach((state, clientId) => {
        // Skip local client
        if (clientId === awareness.clientID) return;

        // Check if this client has our noteId in their selection
        const selectedNoteIds = state.selectedNoteIds || [];
        if (selectedNoteIds.includes(noteId)) {
          othersEditing = true;
        }
      });

      setIsOthersEditing(othersEditing);
    };

    // Initial check
    checkIfOthersEditing();

    // Listen for changes
    awareness.on('change', checkIfOthersEditing);

    return () => {
      awareness.off('change', checkIfOthersEditing);
    };
  }, [noteId, itemStore]);

  return isOthersEditing;
}

