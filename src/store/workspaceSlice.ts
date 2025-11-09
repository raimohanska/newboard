import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, CanvasItem } from '../types';
import { loadWorkspace } from '../utils/storage';

interface WorkspaceState extends Workspace {
  selectedIds: string[];
}

const loadedWorkspace = loadWorkspace();

const initialState: WorkspaceState = {
  items: loadedWorkspace?.items || {},
  selectedIds: [],
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    createItem: (state: WorkspaceState, action: PayloadAction<CanvasItem>) => {
      state.items[action.payload.id] = action.payload;
    },
    moveItem: (state: WorkspaceState, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
      const item = state.items[action.payload.id];
      if (item) {
        item.position = action.payload.position;
      }
    },
    moveSelectedItems: (state: WorkspaceState, action: PayloadAction<{ delta: { x: number; y: number } }>) => {
      const { delta } = action.payload;
      state.selectedIds.forEach(id => {
        const item = state.items[id];
        if (item) {
          item.position.x += delta.x;
          item.position.y += delta.y;
        }
      });
    },
    updateItemContent: (state: WorkspaceState, action: PayloadAction<{ id: string; content: string }>) => {
      const item = state.items[action.payload.id];
      if (item && item.type === 'Note') {
        item.content = action.payload.content;
      }
    },
    deleteItem: (state: WorkspaceState, action: PayloadAction<string>) => {
      delete state.items[action.payload];
      state.selectedIds = state.selectedIds.filter(id => id !== action.payload);
    },
    selectItem: (state: WorkspaceState, action: PayloadAction<string>) => {
      state.selectedIds = [action.payload];
    },
    toggleSelection: (state: WorkspaceState, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.selectedIds.indexOf(id);
      if (index > -1) {
        state.selectedIds.splice(index, 1);
      } else {
        state.selectedIds.push(id);
      }
    },
    clearSelection: (state: WorkspaceState) => {
      state.selectedIds = [];
    },
    selectMultipleItems: (state: WorkspaceState, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },
    bulkCreateItems: (state: WorkspaceState, action: PayloadAction<CanvasItem[]>) => {
      action.payload.forEach(item => {
        state.items[item.id] = item;
      });
    },
  },
});

export const { 
  createItem, 
  moveItem, 
  moveSelectedItems,
  updateItemContent, 
  deleteItem,
  selectItem,
  toggleSelection,
  clearSelection,
  selectMultipleItems,
  bulkCreateItems,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;

