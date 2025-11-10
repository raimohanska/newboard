import { memo } from 'react';
import * as Y from 'yjs';
import styled from 'styled-components';
import { useYText } from '../hooks/useYText';

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

export const PlainTextView = memo(({ yText }: PlainTextViewProps) => {
  const plainText = useYText(yText);
  
  return (
    <PlainTextViewContainer>
      {plainText || <span style={{ color: '#999' }}>Type here...</span>}
    </PlainTextViewContainer>
  );
});

