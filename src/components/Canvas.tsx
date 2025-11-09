import { useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { clearSelection, startSelectionBox } from '../store/workspaceSlice';
import { selectItemIds } from '../store/selectors';
import { Note } from './Note';
import { RectangularSelection } from './RectangularSelection';
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

interface CanvasProps {
  zoom: number;
}

export const Canvas = ({ zoom }: CanvasProps) => {
  increaseRenderCount('Canvas');
  const dispatch = useDispatch();
  const itemIds = useSelector(selectItemIds);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Check if clicking on canvas (not on a note)
    if (e.target !== e.currentTarget) return;
    
    // Check for modifier keys (Ctrl, Cmd, or Alt)
    const isModifierPressed = e.ctrlKey || e.metaKey || e.altKey;
    
    if (isModifierPressed) {
      // Start rectangular selection
      e.preventDefault();
      const scrollWrapper = canvasRef.current?.parentElement?.parentElement;
      if (!scrollWrapper) return;
      
      const wrapperRect = scrollWrapper.getBoundingClientRect();
      const x = (e.clientX - wrapperRect.left + scrollWrapper.scrollLeft) / zoom;
      const y = (e.clientY - wrapperRect.top + scrollWrapper.scrollTop) / zoom;
      
      dispatch(startSelectionBox({ x, y }));
    } else {
      // Clear selection on regular click
      dispatch(clearSelection());
    }
  };

  return (
    <CanvasContainer ref={canvasRef} onMouseDown={handleMouseDown}>
      {itemIds.map(id => (
        <Note key={id} noteId={id} />
      ))}
      <RectangularSelection canvasRef={canvasRef} />
    </CanvasContainer>
  );
};

