import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { RootState } from '../store';

export function useUpdateDragOffset() {
  const { itemStore } = useWorkspace();
  const dragOffset = useSelector((state: RootState) => state.workspace.dragOffset);

  useEffect(() => {
    const awareness = itemStore.getAwareness();
    if (!awareness) return;

    awareness.setLocalStateField('dragOffset', dragOffset);
  }, [dragOffset, itemStore]);
}

