import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { setZoom } from '../store/workspaceSlice';
import { RootState } from '../store';
import { Canvas } from './Canvas';

const Wrapper = styled.div`
  flex: 1;
  overflow: scroll;
  position: relative;
`;

const ZoomContainer = styled.div`
  transform: scale(var(--zoom));
  transform-origin: 0 0;
`;

export const ScrollWrapper = () => {
  const dispatch = useDispatch();
  const zoom = useSelector((state: RootState) => state.workspace.zoom);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e: WheelEvent) => {
      // Check for modifier keys (Ctrl or Cmd)
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      // Get scroll position before zoom
      const scrollLeft = wrapper.scrollLeft;
      const scrollTop = wrapper.scrollTop;
      const rect = wrapper.getBoundingClientRect();
      
      // Mouse position relative to viewport
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Mouse position in canvas coordinates (before zoom)
      const canvasX = (scrollLeft + mouseX) / zoom;
      const canvasY = (scrollTop + mouseY) / zoom;

      // Calculate zoom delta
      const delta = e.deltaY * -0.01;
      const newZoom = Math.max(0.1, Math.min(5, zoom + delta * zoom * 0.1));

      dispatch(setZoom(newZoom));

      // Adjust scroll to keep mouse position fixed
      requestAnimationFrame(() => {
        wrapper.scrollLeft = canvasX * newZoom - mouseX;
        wrapper.scrollTop = canvasY * newZoom - mouseY;
      });
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
    };
  }, [zoom, dispatch]);

  return (
    <Wrapper ref={wrapperRef} data-scroll-wrapper>
      <ZoomContainer style={{ '--zoom': zoom } as React.CSSProperties}>
        <Canvas />
      </ZoomContainer>
    </Wrapper>
  );
};

