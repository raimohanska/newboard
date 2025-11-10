import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Awareness } from 'y-quill';

export function useSelectedIds(): string[] {
  const { itemStore } = useWorkspace();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setSelectedIds([]);
      return;
    }

    const updateSelection = () => {
      const localState = awareness.getLocalState();
      setSelectedIds(localState?.selectedNoteIds || []);
    };

    updateSelection();
    awareness.on('change', updateSelection);

    return () => {
      awareness.off('change', updateSelection);
    };
  }, [itemStore]);

  return selectedIds;
}

export function useIsSelected(itemId: string): boolean {
  const { itemStore } = useWorkspace();
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) {
      setIsSelected(false);
      return;
    }

    const updateSelection = () => {
      const selectedIds = getSelectedIds(awareness);
      setIsSelected(selectedIds.includes(itemId));
    };

    updateSelection();
    awareness.on('change', updateSelection);

    return () => {
      awareness.off('change', updateSelection);
    };
  }, [itemId, itemStore]);

  return isSelected;
}

export function getSelectedIds(awareness: Awareness) {
  const localState = awareness.getLocalState();
  const selectedIds = localState?.selectedNoteIds || [];
  return selectedIds;
}

export function useUpdateSelection() {
  const { itemStore } = useWorkspace();

  const selectItem = useCallback((itemId: string) => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;
    awareness.setLocalStateField('selectedNoteIds', [itemId]);
  }, [itemStore]);

  const toggleSelection = useCallback((itemId: string) => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;
    
    const current = getSelectedIds(awareness);
    const index = current.indexOf(itemId);
    
    if (index > -1) {
      const newSelection = [...current];
      newSelection.splice(index, 1);
      awareness.setLocalStateField('selectedNoteIds', newSelection);
    } else {
      awareness.setLocalStateField('selectedNoteIds', [...current, itemId]);
    }
  }, [itemStore]);

  const clearSelection = useCallback(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;
    awareness.setLocalStateField('selectedNoteIds', []);
  }, [itemStore]);

  const selectMultipleItems = useCallback((itemIds: string[]) => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;
    awareness.setLocalStateField('selectedNoteIds', itemIds);
  }, [itemStore]);

  return { selectItem, toggleSelection, clearSelection, selectMultipleItems };
}

