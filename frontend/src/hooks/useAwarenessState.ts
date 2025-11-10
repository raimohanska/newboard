import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function useAwarenessState<T>(fieldName: string, defaultValue: T): T {
  const { itemStore } = useWorkspace();
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setValue(defaultValue);
      return;
    }

    const updateValue = () => {
      const localState = awareness.getLocalState();
      setValue(localState?.[fieldName] ?? defaultValue);
    };

    updateValue();
    awareness.on('change', updateValue);

    return () => {
      awareness.off('change', updateValue);
    };
  }, [fieldName, defaultValue, itemStore]);

  return value;
}

