import { useState, useRef, useEffect, ReactNode } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { moveSelectedItems, selectItem, toggleSelection } from '../store/workspaceSlice';
import { itemStore } from '../store/ItemStore';
import { useItem } from '../hooks/useItemStore';
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
  const item = useItem(itemId);
  const selectedIds = useSelector((state: RootState) => state.workspace.selectedIds);
  const isSelected = selectedIds.includes(itemId);
  
  // Only observe dragOffset if this item is selected
  const dragOffset = useSelector(
    (state: RootState) => isSelected ? state.workspace.dragOffset : null
  );
  
  if (!item) return null;
  
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply drag offset to selected items
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
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Get zoom from store at interaction time (not reactive)
      const zoom = store.getState().workspace.zoom;
      
      const delta = {
        x: (e.clientX - lastMousePosRef.current.x) / zoom,
        y: (e.clientY - lastMousePosRef.current.y) / zoom,
      };
      
      if (isSelected) {
        // Move all selected items
        dispatch(moveSelectedItems({ delta }));
      }
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Commit positions to Y.js
      const dragOffset = store.getState().workspace.dragOffset;
      if (dragOffset) {
        itemStore.updateItemPositions(
          store.getState().workspace.selectedIds,
          dragOffset.x,
          dragOffset.y
        );
      }
      
      dispatch({ type: 'workspace/commitDrag' });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isSelected, store, dispatch]);

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

