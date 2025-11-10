import { memo } from 'react';
import styled from 'styled-components';
import { useItem } from '../hooks/useItemStore';
import { QuillEditor } from './QuillEditor';
import type { Note as NoteType } from '../types';
import { ItemPositioner } from './ItemPositioner';

interface NoteProps {
  noteId: string;
}

export const Note = ({ noteId }: NoteProps) => {
  return (
    <ItemPositioner itemId={noteId}>
      {({ isDragging, isSelected }) => (
        <NoteContent
          noteId={noteId}
          isDragging={isDragging}
          isSelected={isSelected}
        />
      )}
    </ItemPositioner>
  );
};

interface NoteContentProps {
  noteId: string;
  isDragging: boolean;
  isSelected: boolean;
}

const NoteContent = memo(({ noteId, isDragging, isSelected }: NoteContentProps) => {
  const note = useItem(noteId) as NoteType;
  
  if (!note) return null;

  return (
    <NoteContainer
      $isDragging={isDragging}
      $isSelected={isSelected}
    >
      <QuillEditor yText={note.content} />
    </NoteContainer>
  );
});

const NoteContainer = styled.div<{ $isDragging: boolean; $isSelected: boolean }>`
  width: 100%;
  height: 150px;
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

