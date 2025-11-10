import { useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { updateSelectionBox, endSelectionBox } from '../store/workspaceSlice';
import { useItemIds } from '../hooks/useItemStore';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useUpdateSelection } from '../hooks/useSelection';
import { RootState } from '../store';

const SelectionBox = styled.div`
  position: absolute;
  border: 2px solid #4a90e2;
  background: rgba(74, 144, 226, 0.1);
  pointer-events: none;
  z-index: 1000;
`;

interface RectangularSelectionProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const RectangularSelection = ({ canvasRef }: RectangularSelectionProps) => {
  const dispatch = useDispatch();
  const { itemStore } = useWorkspace();
  const { selectMultipleItems } = useUpdateSelection();
  const selectionBox = useSelector((state: RootState) => state.workspace.selectionBox);
  const isSelecting = selectionBox.isActive;
  const itemIds = useItemIds();
  const zoom = useSelector((state: RootState) => state.workspace.zoom);
  
  useEffect(() => {
    if (!isSelecting) return;

    const calculateIntersection = (left: number, right: number, top: number, bottom: number) => {
      return itemIds.filter(id => {
        const item = itemStore.getItem(id);
        if (!item) return false;
        
        const noteLeft = item.position.x;
        const noteTop = item.position.y;
        const noteRight = noteLeft + 200; // Note width
        const noteBottom = noteTop + 150; // Note height
        
        // Check for intersection
        return !(noteRight < left || noteLeft > right || noteBottom < top || noteTop > bottom);
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const scrollWrapper = canvasRef.current?.parentElement?.parentElement;
      if (!scrollWrapper) return;

      const wrapperRect = scrollWrapper.getBoundingClientRect();
      const x = (e.clientX - wrapperRect.left + scrollWrapper.scrollLeft) / zoom;
      const y = (e.clientY - wrapperRect.top + scrollWrapper.scrollTop) / zoom;
      
      dispatch(updateSelectionBox({ x, y }));
      
      // Calculate selection in real-time
      const left = Math.min(selectionBox.startX, x);
      const right = Math.max(selectionBox.startX, x);
      const top = Math.min(selectionBox.startY, y);
      const bottom = Math.max(selectionBox.startY, y);
      
      const selectedIds = calculateIntersection(left, right, top, bottom);
      selectMultipleItems(selectedIds);
    };

    const handleMouseUp = () => {
      dispatch(endSelectionBox());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionBox, itemIds, zoom, dispatch, canvasRef]);

  if (!selectionBox.isActive) return null;

  const style = {
    left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
    top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
    width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
    height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
  };

  return <SelectionBox style={style} />;
};

