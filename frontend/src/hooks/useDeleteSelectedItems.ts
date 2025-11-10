import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { clearSelection } from '../store/workspaceSlice';
import { RootState } from '../store';

export const useDeleteSelectedItems = () => {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const { itemStore } = useWorkspace();

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
        // Get selected IDs from store at interaction time (not reactive)
        const selectedIds = store.getState().workspace.selectedIds;
        
        if (selectedIds.length > 0) {
          e.preventDefault();
          
          // Delete all selected items in a single transaction
          itemStore.deleteItems(selectedIds);
          
          // Clear selection
          dispatch(clearSelection());
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [store, dispatch, itemStore]);
};

