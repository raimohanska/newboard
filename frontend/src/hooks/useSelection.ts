import { useCallback } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAwarenessState } from './useAwarenessState';
import { Awareness } from 'y-quill';

export function useSelectedIds(): string[] {
  return useAwarenessState<string[]>('selectedNoteIds', []);
}

export function useIsSelected(itemId: string): boolean {
  const selectedIds = useAwarenessState<string[]>('selectedNoteIds', []);
  return selectedIds.includes(itemId);
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

