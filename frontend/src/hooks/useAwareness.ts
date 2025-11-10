import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface CursorState {
  x: number;
  y: number;
  name: string;
  color: string;
}

interface AwarenessState {
  clientId: number;
  cursor: CursorState | null;
}

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

function getRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

function getRandomName(): string {
  const adjectives = ['Happy', 'Clever', 'Bright', 'Swift', 'Bold', 'Kind'];
  const animals = ['Panda', 'Fox', 'Owl', 'Eagle', 'Tiger', 'Dolphin'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`;
}

export function useAwareness() {
  const { itemStore } = useWorkspace();
  const [otherUsers, setOtherUsers] = useState<Map<number, AwarenessState>>(new Map());

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;

    // Set local user state
    awareness.setLocalStateField('user', {
      name: getRandomName(),
      color: getRandomColor(),
    });

    // Listen for changes
    const handleChange = () => {
      const states = awareness.getStates();
      const others = new Map<number, AwarenessState>();
      
      states.forEach((state, clientId) => {
        if (clientId !== awareness.clientID) {
          others.set(clientId, {
            clientId,
            cursor: state.cursor || null,
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
      awareness.setLocalStateField('cursor', null);
    } else {
      const user = awareness.getLocalState()?.user;
      awareness.setLocalStateField('cursor', {
        x,
        y,
        name: user?.name || 'Anonymous',
        color: user?.color || '#000000',
      });
    }
  };
}

