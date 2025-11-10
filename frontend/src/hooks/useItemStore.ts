import { useState, useEffect } from 'react';
import { itemStore } from '../store/ItemStore';
import { CanvasItem } from '../types';

export const useItemIds = (): string[] => {
  const [itemIds, setItemIds] = useState<string[]>(itemStore.getItemIds());

  useEffect(() => {
    const unsubscribe = itemStore.subscribeToItemIds(() => {
      setItemIds(itemStore.getItemIds());
    });

    return unsubscribe;
  }, []);

  return itemIds;
};

export const useItem = (itemId: string): CanvasItem | undefined => {
  const [item, setItem] = useState<CanvasItem | undefined>(() => itemStore.getItem(itemId));

  useEffect(() => {
    const unsubscribe = itemStore.subscribeToItem(itemId, () => {
      setItem(itemStore.getItem(itemId));
    });

    return unsubscribe;
  }, [itemId]);

  return item;
};

