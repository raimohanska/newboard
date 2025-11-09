import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { moveSelectedItems, commitDrag, updateItemContent, selectItem, toggleSelection } from '../store/workspaceSlice';
import { RootState } from '../store';
import type { Note as NoteType } from '../types';
import { increaseRenderCount } from '../utils/renderCounts';

const NoteContainer = styled.div<{ $isDragging: boolean; $isSelected: boolean }>`
  position: absolute;
  width: 200px;
  min-height: 150px;
  background: #fef68a;
  border: ${props => props.$isSelected ? '3px solid #4a90e2' : '1px solid #e6d84e'};
  border-radius: 4px;
  padding: 12px;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  box-shadow: ${props => props.$isSelected 
    ? '0 4px 16px rgba(74, 144, 226, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  user-select: none;

  &:hover {
    box-shadow: ${props => props.$isSelected 
      ? '0 6px 20px rgba(74, 144, 226, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 30px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  cursor: text;
`;

interface NoteProps {
  noteId: string;
}

export const Note = ({ noteId }: NoteProps) => {
  //increaseRenderCount('Note');
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const note = useSelector((state: RootState) => state.workspace.items[noteId] as NoteType);
  const selectedIds = useSelector((state: RootState) => state.workspace.selectedIds);
  const dragOffset = useSelector((state: RootState) => state.workspace.dragOffset);
  const isSelected = selectedIds.includes(noteId);
  
  if (!note) return null;
  
  // Apply drag offset to selected notes
  const displayPosition = isSelected && dragOffset
    ? { x: note.position.x + dragOffset.x, y: note.position.y + dragOffset.y }
    : note.position;
  
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }
    
    e.preventDefault();
    
    // Handle selection
    if (e.shiftKey) {
      dispatch(toggleSelection(note.id));
    } else if (!isSelected) {
      dispatch(selectItem(note.id));
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
      dispatch(commitDrag());
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isSelected, store, dispatch]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(updateItemContent({
      id: note.id,
      content: e.target.value,
    }));
  };

  return (
    <NoteContainer
      ref={containerRef}
      $isDragging={isDragging}
      $isSelected={isSelected}
      onMouseDown={handleMouseDown}
      style={{
        left: `${displayPosition.x}px`,
        top: `${displayPosition.y}px`,
      }}
    >
      <TextArea
        value={note.content}
        onChange={handleContentChange}
        placeholder="Type here..."
      />
    </NoteContainer>
  );
};

