import { memo } from 'react';
import * as Y from 'yjs';
import styled from 'styled-components';
import { useYText } from '../hooks/useYText';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useUpdateSelection } from '../hooks/useSelection';

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
  cursor: text;
`;

interface PlainTextViewProps {
  yText: Y.Text;
  noteId: string;
}

export const PlainTextView = memo(({ yText, noteId }: PlainTextViewProps) => {
  const plainText = useYText(yText);
  const { itemStore } = useWorkspace();
  const { selectItem } = useUpdateSelection();

  const handleClick = () => {
    const awareness = itemStore.getAwareness();
    if (awareness) {
      awareness.setLocalStateField('editingId', noteId);
      selectItem(noteId);
    }
  };
  
  return (
    <PlainTextViewContainer onClick={handleClick}>
      {plainText || <span style={{ color: '#999' }}>Type here...</span>}
    </PlainTextViewContainer>
  );
});

