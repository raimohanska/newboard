import * as Y from 'yjs';
import { yItems, itemToYMap, ydoc } from './yjs';
import { CanvasItem } from '../types';
import { store } from './index';

export const createItem = (item: CanvasItem) => {
  const ymap = itemToYMap(item);
  yItems.set(item.id, ymap);
};

export const bulkCreateItems = (items: CanvasItem[]) => {
  ydoc.transact(() => {
    items.forEach(item => {
      const ymap = itemToYMap(item);
      yItems.set(item.id, ymap);
    });
  });
};

export const updateItemContent = (id: string, content: string) => {
  const ymap = yItems.get(id);
  if (ymap && ymap.get('type') === 'Note') {
    ymap.set('content', content);
  }
};

export const deleteItem = (id: string) => {
  yItems.delete(id);
  // Also remove from selection
  const state = store.getState();
  if (state.workspace.selectedIds.includes(id)) {
    store.dispatch({ type: 'workspace/selectMultipleItems', payload: state.workspace.selectedIds.filter(sid => sid !== id) });
  }
};

export const commitItemPositions = () => {
  const state = store.getState();
  const dragOffset = state.workspace.dragOffset;
  const selectedIds = state.workspace.selectedIds;
  
  if (dragOffset) {
    ydoc.transact(() => {
      selectedIds.forEach(id => {
        const ymap = yItems.get(id);
        if (ymap) {
          const posMap = ymap.get('position') as Y.Map<number>;
          if (posMap) {
            posMap.set('x', (posMap.get('x') || 0) + dragOffset.x);
            posMap.set('y', (posMap.get('y') || 0) + dragOffset.y);
          }
        }
      });
    });
  }
};

