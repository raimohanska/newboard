import { memo } from 'react';
import styled from 'styled-components';
import { useItem } from '../hooks/useItemStore';
import { QuillEditor } from './QuillEditor';
import { PlainTextView } from './PlainTextView';
import { useIsSelectedByOthers } from '../hooks/useIsSelectedByOthers';
import { useIsEditedByOthers } from '../hooks/useIsEditedByOthers';
import { useAwarenessState } from '../hooks/useAwarenessState';
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
  const otherSelectedColor = useIsSelectedByOthers(noteId);
  const isEditedByOthers = useIsEditedByOthers(noteId);
  const localEditingId = useAwarenessState<string | null>('editingId', null);
  
  if (!note) return null;

  // Show QuillEditor if this note is being edited (locally or by others)
  const isEditedLocally = localEditingId === noteId;
  const showEditor = isEditedLocally || isEditedByOthers;

  return (
    <NoteContainer
      $isDragging={isDragging}
      $isSelected={isSelected}
      $isSelectedByOthers={otherSelectedColor !== null}
      $othersColor={otherSelectedColor}
    >
      {showEditor ? (
        <QuillEditor yText={note.content} noteId={noteId} />
      ) : (
        <PlainTextView yText={note.content} noteId={noteId} />
      )}
    </NoteContainer>
  );
});

const NoteContainer = styled.div<{ 
  $isDragging: boolean; 
  $isSelected: boolean; 
  $isSelectedByOthers: boolean;
  $othersColor: string | null;
}>`
  width: 100%;
  height: 150px;
  background: #fef68a;
  border: ${props => {
    if (props.$isSelected) return '3px solid #4a90e2';
    if (props.$isSelectedByOthers && props.$othersColor) return `3px solid ${props.$othersColor}`;
    return '1px solid #e6d84e';
  }};
  border-radius: 4px;
  padding: 12px;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  box-shadow: ${props => props.$isSelected 
    ? '0 4px 16px rgba(74, 144, 226, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  user-select: none;
  filter: ${props => props.$isSelectedByOthers && !props.$isSelected ? 'opacity(0.6)' : 'none'};
  transition: filter 0.2s ease, border 0.2s ease;

  &:hover {
    box-shadow: ${props => props.$isSelected 
      ? '0 6px 20px rgba(74, 144, 226, 0.4)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)'};
  }
`;

