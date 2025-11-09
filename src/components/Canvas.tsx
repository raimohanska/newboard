import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { clearSelection } from '../store/workspaceSlice';
import { selectItemIds } from '../store/selectors';
import { Note } from './Note';
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

export const Canvas = () => {
  increaseRenderCount('Canvas');
  const dispatch = useDispatch();
  const itemIds = useSelector(selectItemIds);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch(clearSelection());
    }
  };

  return (
    <CanvasContainer onMouseDown={handleCanvasClick}>
      {itemIds.map(id => (
        <Note key={id} noteId={id} />
      ))}
    </CanvasContainer>
  );
};

