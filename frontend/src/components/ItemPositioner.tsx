import { useState, useRef, useEffect, ReactNode } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { selectItem, toggleSelection } from '../store/workspaceSlice';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useItem } from '../hooks/useItemStore';
import { useDragOffset } from '../hooks/useDragOffset';
import { RootState } from '../store';

const ItemPositionerContainer = styled.div`
  position: absolute;
  width: 200px;
  min-height: 150px;
  content-visibility: auto;
  contain-intrinsic-size: 200px 150px;
`;

interface ItemPositionerProps {
  itemId: string;
  children: (props: {
    isDragging: boolean;
    isSelected: boolean;
  }) => ReactNode;
}

export const ItemPositioner = ({ itemId, children }: ItemPositionerProps) => {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const { itemStore } = useWorkspace();
  const item = useItem(itemId);
  const selectedIds = useSelector((state: RootState) => state.workspace.selectedIds);
  const isSelected = selectedIds.includes(itemId);
  
  // Get drag offset from awareness (local or others)
  const dragOffset = useDragOffset(itemId);
  
  if (!item) return null;
  
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply drag offset
  const displayPosition = dragOffset
    ? { x: item.position.x + dragOffset.x, y: item.position.y + dragOffset.y }
    : item.position;

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Don't intercept clicks on editor elements
    if (
      target.tagName === 'TEXTAREA' ||
      target.closest('.ql-editor') ||
      target.closest('.ql-container')
    ) {
      return;
    }
    
    e.preventDefault();
    
    // Handle selection
    if (e.shiftKey) {
      dispatch(toggleSelection(itemId));
    } else if (!isSelected) {
      dispatch(selectItem(itemId));
    }
    
    // Start dragging
    setIsDragging(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    if (!isDragging) return;

    const awareness = itemStore.getAwareness();

    const handleMouseMove = (e: MouseEvent) => {
      // Get zoom from store at interaction time (not reactive)
      const zoom = store.getState().workspace.zoom;
      
      const delta = {
        x: (e.clientX - lastMousePosRef.current.x) / zoom,
        y: (e.clientY - lastMousePosRef.current.y) / zoom,
      };
      
      if (isSelected) {
        // Update drag offset in awareness
        dragOffsetRef.current.x += delta.x;
        dragOffsetRef.current.y += delta.y;
        
        if (awareness) {
          awareness.setLocalStateField('dragOffset', { ...dragOffsetRef.current });
        }
      }
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Commit positions to Y.js
      if (dragOffsetRef.current.x !== 0 || dragOffsetRef.current.y !== 0) {
        itemStore.updateItemPositions(
          store.getState().workspace.selectedIds,
          dragOffsetRef.current.x,
          dragOffsetRef.current.y
        );
      }
      
      // Clear drag offset from awareness
      if (awareness) {
        awareness.setLocalStateField('dragOffset', null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isSelected, store, itemStore]);

  return (
    <ItemPositionerContainer
      ref={containerRef}
      style={{
        left: `${displayPosition.x}px`,
        top: `${displayPosition.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {children({ isDragging, isSelected })}
    </ItemPositionerContainer>
  );
};

