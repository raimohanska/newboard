import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { itemStore } from '../store/ItemStore';
import { useItemIds } from '../hooks/useItemStore';
import { RootState } from '../store';
import type { Note } from '../types';

const SidebarContainer = styled.div`
  width: 240px;
  height: 100%;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
`;

const Counter = styled.div`
  margin-bottom: 20px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
  color: #666;
  text-align: center;
`;

const DraggableNote = styled.div<{ $isDragging: boolean }>`
  width: 120px;
  height: 100px;
  background: #fef68a;
  border: 1px solid #e6d84e;
  border-radius: 4px;
  padding: 12px;
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  user-select: none;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const DraggingPreview = styled.div`
  position: fixed;
  width: 120px;
  height: 100px;
  background: #fef68a;
  border: 1px solid #e6d84e;
  border-radius: 4px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  z-index: 1000;
`;

const TestButton = styled.button`
  margin-top: 30px;
  padding: 10px 16px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;

  &:hover {
    background: #357abd;
  }

  &:active {
    background: #2868a8;
  }
`;

export const Sidebar = () => {
  const dispatch = useDispatch();
  const itemIds = useItemIds();
  const zoom = useSelector((state: RootState) => state.workspace.zoom);
  const noteCount = itemIds.length;
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleAddTestItems = () => {
    const items: Note[] = [];
    for (let i = 0; i < 1000; i++) {
      items.push({
        id: `test-note-${Date.now()}-${i}`,
        type: 'Note',
        position: {
          x: Math.random() * 9800,
          y: Math.random() * 9800,
        },
        content: `Test note ${i + 1}`,
      });
    }
    itemStore.bulkCreateItems(items);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      
      // Check if dropped on canvas area (not on sidebar)
      if (e.clientX > 240) {
        const scrollWrapper = document.querySelector('[data-scroll-wrapper]') as HTMLElement;
        if (scrollWrapper) {
          const rect = scrollWrapper.getBoundingClientRect();
          const newNote: Note = {
            id: `note-${Date.now()}`,
            type: 'Note',
            position: {
              x: (e.clientX - rect.left + scrollWrapper.scrollLeft - dragOffset.x) / zoom,
              y: (e.clientY - rect.top + scrollWrapper.scrollTop - dragOffset.y) / zoom,
            },
            content: '',
          };
          itemStore.createItem(newNote);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, zoom, dispatch]);

  return (
    <>
      <SidebarContainer>
        <Title>Elements</Title>
        <Counter>
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </Counter>
        <DraggableNote
          $isDragging={isDragging}
          onMouseDown={handleMouseDown}
        >
          Note
        </DraggableNote>
        <TestButton onClick={handleAddTestItems}>
          Add 1000 Notes
        </TestButton>
      </SidebarContainer>
      {isDragging && (
        <DraggingPreview
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
          }}
        >
          Note
        </DraggingPreview>
      )}
    </>
  );
};

