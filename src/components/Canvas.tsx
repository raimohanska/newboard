import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { clearSelection } from '../store/workspaceSlice';
import { Note } from './Note';

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
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.workspace.items);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch(clearSelection());
    }
  };

  return (
    <CanvasContainer onMouseDown={handleCanvasClick}>
      {Object.values(items).map(item => {
        if (item.type === 'Note') {
          return <Note key={item.id} note={item} />;
        }
        return null;
      })}
    </CanvasContainer>
  );
};

