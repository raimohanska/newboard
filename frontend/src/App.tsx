import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { Sidebar } from './components/Sidebar';
import { ScrollWrapper } from './components/ScrollWrapper';
import { useDeleteSelectedItems } from './hooks/useDeleteSelectedItems';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useUpdateSelection } from './hooks/useUpdateSelection';

const AppContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

function App() {
  useDeleteSelectedItems();
  useUndoRedo();
  useUpdateSelection();

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Sidebar />
        <ScrollWrapper />
      </AppContainer>
    </>
  );
}

export default App;

