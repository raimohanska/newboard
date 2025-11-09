import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { clearSelection, selectMultipleItems } from '../store/workspaceSlice';
import { selectItemIds } from '../store/selectors';
import { RootState } from '../store';
import { Note } from './Note';
import { increaseRenderCount } from '../utils/renderCounts';

const CanvasContainer = styled.div`
  position: relative;
  width: 10000px;
  height: 10000px;
  background: 
    linear-gradient(to right, #e0e0e0 1px, transparent 1px),
    linear-gradient(to bottom, #e0e0e0 1px, transparent 1px);
  background-size: 50px 50px;
  background-color: #ffffff;
`;

const SelectionBox = styled.div`
  position: absolute;
  border: 2px solid #4a90e2;
  background: rgba(74, 144, 226, 0.1);
  pointer-events: none;
  z-index: 1000;
`;

export const Canvas = () => {
  increaseRenderCount('Canvas');
  const dispatch = useDispatch();
  const itemIds = useSelector(selectItemIds);
  const items = useSelector((state: RootState) => state.workspace.items);
  
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if clicking on canvas (not on a note)
    if (e.target !== e.currentTarget) return;
    
    // Check for modifier keys (Ctrl, Cmd, or Alt)
    const isModifierPressed = e.ctrlKey || e.metaKey || e.altKey;
    
    if (isModifierPressed) {
      // Start rectangular selection
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = e.clientX - rect.left + (canvasRef.current?.parentElement?.scrollLeft || 0);
      const y = e.clientY - rect.top + (canvasRef.current?.parentElement?.scrollTop || 0);
      
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
    } else {
      // Clear selection on regular click
      dispatch(clearSelection());
    }
  };

  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left + (canvasRef.current?.parentElement?.scrollLeft || 0);
      const y = e.clientY - rect.top + (canvasRef.current?.parentElement?.scrollTop || 0);
      
      setSelectionEnd({ x, y });
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      
      // Calculate selection rectangle bounds
      const left = Math.min(selectionStart.x, selectionEnd.x);
      const right = Math.max(selectionStart.x, selectionEnd.x);
      const top = Math.min(selectionStart.y, selectionEnd.y);
      const bottom = Math.max(selectionStart.y, selectionEnd.y);
      
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
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, selectionStart, selectionEnd, itemIds, items, dispatch]);

  const selectionStyle = {
    left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
    top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
    width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
    height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
  };

  return (
    <CanvasContainer ref={canvasRef} onMouseDown={handleMouseDown}>
      {itemIds.map(id => (
        <Note key={id} noteId={id} />
      ))}
      {isSelecting && <SelectionBox style={selectionStyle} />}
    </CanvasContainer>
  );
};

