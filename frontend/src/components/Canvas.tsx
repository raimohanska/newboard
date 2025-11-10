import { useRef, memo } from 'react';
import styled from 'styled-components';
import { useStore } from 'react-redux';
import { useItemIds } from '../hooks/useItemStore';
import { useUpdateSelection } from '../hooks/useSelection';
import { useUpdateSelectionBox } from '../hooks/useSelectionBox';
import { RootState } from '../store';
import { Note } from './Note';
import { RectangularSelection } from './RectangularSelection';
import { Cursors } from './Cursors';
import { useUpdateCursor } from '../hooks/useAwareness';
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


export const Canvas = memo((() => {
    increaseRenderCount('Canvas');
    const store = useStore<RootState>();
    const itemIds = useItemIds();
    const updateCursor = useUpdateCursor();
    const { clearSelection } = useUpdateSelection();
    const { startSelectionBox } = useUpdateSelectionBox();

    const canvasRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
      const scrollWrapper = canvasRef.current?.parentElement?.parentElement;
      if (!scrollWrapper) return;

      const zoom = store.getState().workspace.zoom;
      const wrapperRect = scrollWrapper.getBoundingClientRect();
      const x = (e.clientX - wrapperRect.left + scrollWrapper.scrollLeft) / zoom;
      const y = (e.clientY - wrapperRect.top + scrollWrapper.scrollTop) / zoom;

      updateCursor(x, y);
    };

    const handleMouseLeave = () => {
      updateCursor(null, null);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      // Check if clicking on canvas (not on a note)
      if (e.target !== e.currentTarget) return;

      // Clear selection when clicking on canvas background
      clearSelection();

      // Start rectangular selection on canvas drag
      e.preventDefault();
      const scrollWrapper = canvasRef.current?.parentElement?.parentElement;
      if (!scrollWrapper) return;

      // Get zoom from store at interaction time (not reactive)
      const zoom = store.getState().workspace.zoom;

      const wrapperRect = scrollWrapper.getBoundingClientRect();
      const x = (e.clientX - wrapperRect.left + scrollWrapper.scrollLeft) / zoom;
      const y = (e.clientY - wrapperRect.top + scrollWrapper.scrollTop) / zoom;

      startSelectionBox(x, y);
    };

    return (
      <CanvasContainer 
        ref={canvasRef} 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {itemIds.map(id => (
          <Note key={id} noteId={id} />
        ))}
        <RectangularSelection canvasRef={canvasRef} />
        <Cursors />
      </CanvasContainer>
    );
  }));

