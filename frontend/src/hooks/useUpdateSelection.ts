import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { RootState } from '../store';

export function useUpdateSelection() {
  const { itemStore } = useWorkspace();
  const selectedIds = useSelector((state: RootState) => state.workspace.selectedIds);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;

    awareness.setLocalStateField('selectedNoteIds', selectedIds);
  }, [selectedIds, itemStore]);
}

