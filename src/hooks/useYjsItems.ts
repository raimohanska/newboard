import { useState, useEffect } from 'react';
import { yItems, yMapToItem } from '../store/yjs';
import { CanvasItem } from '../types';

// Hook to get item IDs only (observes add/remove, not deep changes)
export const useYjsItemIds = (): string[] => {
  const [itemIds, setItemIds] = useState<string[]>(Array.from(yItems.keys()));

  useEffect(() => {
    const observer = () => {
      setItemIds(Array.from(yItems.keys()));
    };

    // Observe only additions/removals, not deep changes
    yItems.observe(observer);

    return () => {
      yItems.unobserve(observer);
    };
  }, []);

  return itemIds;
};

export const useYjsItem = (itemId: string): CanvasItem | undefined => {
  const ymap = yItems.get(itemId);
  const [item, setItem] = useState<CanvasItem | undefined>(ymap ? yMapToItem(ymap) : undefined);

  useEffect(() => {
    const observer = () => {
      const ymap = yItems.get(itemId);
      setItem(ymap ? yMapToItem(ymap) : undefined);
    };

    // Observe deep to catch nested position changes
    const ymap = yItems.get(itemId);
    if (ymap) {
      ymap.observeDeep(observer);
      setItem(yMapToItem(ymap));
    }

    yItems.observe(observer);

    return () => {
      if (ymap) {
        ymap.unobserveDeep(observer);
      }
      yItems.unobserve(observer);
    };
  }, [itemId]);

  return item;
};

