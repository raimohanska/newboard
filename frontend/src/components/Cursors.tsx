import styled from 'styled-components';
import { useAwareness } from '../hooks/useAwareness';

const CursorContainer = styled.div<{ $x: number; $y: number; $color: string }>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  pointer-events: none;
  z-index: 10000;
  transition: all 0.1s ease-out;
`;

const CursorSvg = styled.svg<{ $color: string }>`
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
  
  path {
    fill: ${props => props.$color};
  }
`;

const CursorLabel = styled.div<{ $color: string }>`
  position: absolute;
  left: 12px;
  top: 12px;
  background: ${props => props.$color};
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  font-weight: 500;
`;

export const Cursors = () => {
  const { otherUsers } = useAwareness();

  return (
    <>
      {Array.from(otherUsers.values()).map(({ clientId, cursor }) => {
        if (!cursor) return null;

        return (
          <CursorContainer
            key={clientId}
            $x={cursor.x}
            $y={cursor.y}
            $color={cursor.color}
          >
            <CursorSvg $color={cursor.color} viewBox="0 0 24 24">
              <path d="M5.65376 12.3673L1 3L11.3612 7.26604L8.70696 10.3111L14.372 16.6796L12.1766 18.75L6.51163 12.3673H5.65376Z" />
            </CursorSvg>
            <CursorLabel $color={cursor.color}>
              {cursor.name}
            </CursorLabel>
          </CursorContainer>
        );
      })}
    </>
  );
};

