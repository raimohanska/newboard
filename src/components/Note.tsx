import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { moveItem, updateItemContent } from '../store/workspaceSlice';
import type { Note as NoteType } from '../types';

const NoteContainer = styled.div<{ $isDragging: boolean }>`
  position: absolute;
  width: 200px;
  min-height: 150px;
  background: #fef68a;
  border: 1px solid #e6d84e;
  border-radius: 4px;
  padding: 12px;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  user-select: none;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  note: NoteType;
}

export const Note = ({ note }: NoteProps) => {
  const dispatch = useDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - note.position.x,
      y: e.clientY - note.position.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      dispatch(moveItem({
        id: note.id,
        position: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      }));
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
  }, [isDragging, dragOffset, note.id, dispatch]);

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

