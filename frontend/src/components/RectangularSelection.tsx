import { useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useItemIds } from '../hooks/useItemStore';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useUpdateSelection } from '../hooks/useSelection';
import { useSelectionBox, useUpdateSelectionBox } from '../hooks/useSelectionBox';
import { useAllSelectionBoxes } from '../hooks/useAllSelectionBoxes';
import { RootState } from '../store';

const SelectionBox = styled.div<{ $color: string; $isLocal: boolean }>`
  position: absolute;
  border: 2px solid ${props => {
    const rgb = hexToRgb(props.$color);
    const opacity = props.$isLocal ? 1 : 0.5;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }};
  background: ${props => {
    const rgb = hexToRgb(props.$color);
    const opacity = props.$isLocal ? 0.1 : 0.05;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }};
  pointer-events: none;
  z-index: 1000;
`;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 74, g: 144, b: 226 };
}

interface RectangularSelectionProps {
  canvasRef: React.RefObject<HTMLDivElement>;
}

export const RectangularSelection = ({ canvasRef }: RectangularSelectionProps) => {
  const { itemStore } = useWorkspace();
  const { selectMultipleItems } = useUpdateSelection();
  const { updateSelectionBox, endSelectionBox } = useUpdateSelectionBox();
  const selectionBox = useSelectionBox();
  const allBoxes = useAllSelectionBoxes();
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
      
      updateSelectionBox(x, y);
      
      // Calculate selection in real-time
      const left = Math.min(selectionBox.startX, x);
      const right = Math.max(selectionBox.startX, x);
      const top = Math.min(selectionBox.startY, y);
      const bottom = Math.max(selectionBox.startY, y);
      
      const selectedIds = calculateIntersection(left, right, top, bottom);
      selectMultipleItems(selectedIds);
    };

    const handleMouseUp = () => {
      endSelectionBox();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionBox, itemIds, zoom, canvasRef, updateSelectionBox, endSelectionBox, selectMultipleItems, itemStore]);

  return (
    <>
      {allBoxes.map(({ clientId, isLocal, color, selectionBox: box }) => {
        const style = {
          left: `${Math.min(box.startX, box.endX)}px`,
          top: `${Math.min(box.startY, box.endY)}px`,
          width: `${Math.abs(box.endX - box.startX)}px`,
          height: `${Math.abs(box.endY - box.startY)}px`,
        };

        return (
          <SelectionBox 
            key={clientId} 
            style={style} 
            $color={color}
            $isLocal={isLocal}
          />
        );
      })}
    </>
  );
};

