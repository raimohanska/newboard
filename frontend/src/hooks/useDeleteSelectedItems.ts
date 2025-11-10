import { useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { getSelectedIds, useUpdateSelection } from './useSelection';

export const useDeleteSelectedItems = () => {
  const { itemStore } = useWorkspace();
  const { clearSelection } = useUpdateSelection();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if typing in an input/textarea or Quill editor
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('.ql-editor')
      ) {
        return;
      }

      // Delete or Backspace key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const awareness = itemStore.getAwareness();
        if (!awareness) return;

        // Get selected IDs from awareness
        const selectedIds = getSelectedIds(awareness);
        
        if (selectedIds.length > 0) {
          e.preventDefault();
          
          // Delete all selected items in a single transaction
          itemStore.deleteItems(selectedIds);
          
          // Clear selection
          clearSelection();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [itemStore, clearSelection]);
};

