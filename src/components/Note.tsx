import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { moveSelectedItems, updateItemContent, selectItem, toggleSelection } from '../store/workspaceSlice';
import { RootState } from '../store';
import type { Note as NoteType } from '../types';

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
  min-height: 120px;
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
  const note = useSelector((state: RootState) => state.workspace.items[noteId] as NoteType);
  const selectedIds = useSelector((state: RootState) => state.workspace.selectedIds);
  const zoom = useSelector((state: RootState) => state.workspace.zoom);
  const isSelected = selectedIds.includes(noteId);
  
  if (!note) return null;
  
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
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isSelected, zoom, dispatch]);

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
        left: `${note.position.x}px`,
        top: `${note.position.y}px`,
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

