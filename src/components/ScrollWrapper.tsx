import styled from 'styled-components';
import { Canvas } from './Canvas';

const Wrapper = styled.div`
  flex: 1;
  overflow: scroll;
  position: relative;
`;

export const ScrollWrapper = () => {
  return (
    <Wrapper data-scroll-wrapper>
      <Canvas />
    </Wrapper>
  );
};

