import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface CanvasCursorState {
  x: number;
  y: number;
  name: string;
  color: string;
}

interface AwarenessState {
  clientId: number;
  canvasCursor: CanvasCursorState | null;
}

export function useAwareness() {
  const { itemStore } = useWorkspace();
  const [otherUsers, setOtherUsers] = useState<Map<number, AwarenessState>>(new Map());

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;

    // Listen for changes
    const handleChange = () => {
      const states = awareness.getStates();
      const others = new Map<number, AwarenessState>();
      
      states.forEach((state, clientId) => {
        if (clientId !== awareness.clientID) {
          others.set(clientId, {
            clientId,
            canvasCursor: state.canvasCursor || null,
          });
        }
      });

      setOtherUsers(others);
    };

    awareness.on('change', handleChange);
    handleChange(); // Initial call

    return () => {
      awareness.off('change', handleChange);
    };
  }, [itemStore]);

  return { otherUsers };
}

export function useUpdateCursor() {
  const { itemStore } = useWorkspace();

  return (x: number | null, y: number | null) => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;

    if (x === null || y === null) {
      awareness.setLocalStateField('canvasCursor', null);
    } else {
      const user = awareness.getLocalState()?.user;
      awareness.setLocalStateField('canvasCursor', {
        x,
        y,
        name: user?.name || 'Anonymous',
        color: user?.color || '#000000',
      });
    }
  };
}

