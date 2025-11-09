import { useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { selectMultipleItems, updateSelectionBox, endSelectionBox } from '../store/workspaceSlice';
import { selectItemIds } from '../store/selectors';
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
  const selectionBox = useSelector((state: RootState) => state.workspace.selectionBox);
  const isSelecting = selectionBox.isActive;
  const itemIds = useSelector(selectItemIds);
  const items = useSelector((state: RootState) => state.workspace.items);
  
  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left + (canvasRef.current?.parentElement?.scrollLeft || 0);
      const y = e.clientY - rect.top + (canvasRef.current?.parentElement?.scrollTop || 0);
      
      dispatch(updateSelectionBox({ x, y }));
    };

    const handleMouseUp = () => {
      // Calculate selection rectangle bounds
      const left = Math.min(selectionBox.startX, selectionBox.endX);
      const right = Math.max(selectionBox.startX, selectionBox.endX);
      const top = Math.min(selectionBox.startY, selectionBox.endY);
      const bottom = Math.max(selectionBox.startY, selectionBox.endY);
      
      // Find all notes that intersect with selection rectangle
      const selectedIds = itemIds.filter(id => {
        const item = items[id];
        if (!item) return false;
        
        const noteLeft = item.position.x;
        const noteTop = item.position.y;
        const noteRight = noteLeft + 200; // Note width
        const noteBottom = noteTop + 150; // Note min-height
        
        // Check for intersection
        return !(noteRight < left || noteLeft > right || noteBottom < top || noteTop > bottom);
      });
      
      dispatch(selectMultipleItems(selectedIds));
      dispatch(endSelectionBox());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionBox, itemIds, items, dispatch, canvasRef]);

  if (!selectionBox.isActive) return null;

  const style = {
    left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
    top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
    width: `${Math.abs(selectionBox.endX - selectionBox.startX)}px`,
    height: `${Math.abs(selectionBox.endY - selectionBox.startY)}px`,
  };

  return <SelectionBox style={style} />;
};

