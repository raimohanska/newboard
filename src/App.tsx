import styled from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { Sidebar } from './components/Sidebar';
import { ScrollWrapper } from './components/ScrollWrapper';

const AppContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

function App() {
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

