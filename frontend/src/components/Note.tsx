import { memo } from 'react';
import * as Y from 'yjs';
import styled from 'styled-components';
import { useItem } from '../hooks/useItemStore';
import { useYText } from '../hooks/useYText';
import { QuillEditor } from './QuillEditor';
import { useIsSelectedByOthers } from '../hooks/useIsSelectedByOthers';
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

const PlainTextViewContainer = styled.div`
  width: 100%;
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  color: #333;
  min-height: 30px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

interface PlainTextViewProps {
  yText: Y.Text;
}

const PlainTextView = memo(({ yText }: PlainTextViewProps) => {
  const plainText = useYText(yText);
  
  return (
    <PlainTextViewContainer>
      {plainText || <span style={{ color: '#999' }}>Type here...</span>}
    </PlainTextViewContainer>
  );
});

const NoteContent = memo(({ noteId, isDragging, isSelected }: NoteContentProps) => {
  const note = useItem(noteId) as NoteType;
  const othersSelection = useIsSelectedByOthers(noteId);
  
  if (!note) return null;

  // Show QuillEditor if locally selected OR if another user is editing
  const showEditor = isSelected || othersSelection.isSelected;

  return (
    <NoteContainer
      $isDragging={isDragging}
      $isSelected={isSelected}
      $isSelectedByOthers={othersSelection.isSelected}
      $othersColor={othersSelection.color}
    >
      {showEditor ? (
        <QuillEditor yText={note.content} />
      ) : (
        <PlainTextView yText={note.content} />
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

