import { useState, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { CanvasItem } from '../types';

export const useItemIds = (): string[] => {
  const { itemStore } = useWorkspace();
  const [itemIds, setItemIds] = useState<string[]>(itemStore.getItemIds());

  useEffect(() => {
    const unsubscribe = itemStore.subscribeToItemIds(() => {
      setItemIds(itemStore.getItemIds());
    });

    return unsubscribe;
  }, [itemStore]);

  return itemIds;
};

export const useItem = (itemId: string): CanvasItem | undefined => {
  const { itemStore } = useWorkspace();
  const [item, setItem] = useState<CanvasItem | undefined>(() => itemStore.getItem(itemId));

  useEffect(() => {
    const unsubscribe = itemStore.subscribeToItem(itemId, () => {
      setItem(itemStore.getItem(itemId));
    });

    return unsubscribe;
  }, [itemId, itemStore]);

  return item;
};

