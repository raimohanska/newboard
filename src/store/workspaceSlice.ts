import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, CanvasItem } from '../types';

const initialState: Workspace = {
  items: {},
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    createItem: (state: Workspace, action: PayloadAction<CanvasItem>) => {
      state.items[action.payload.id] = action.payload;
    },
    moveItem: (state: Workspace, action: PayloadAction<{ id: string; position: { x: number; y: number } }>) => {
      const item = state.items[action.payload.id];
      if (item) {
        item.position = action.payload.position;
      }
    },
    updateItemContent: (state: Workspace, action: PayloadAction<{ id: string; content: string }>) => {
      const item = state.items[action.payload.id];
      if (item && item.type === 'Note') {
        item.content = action.payload.content;
      }
    },
    deleteItem: (state: Workspace, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },
  },
});

export const { createItem, moveItem, updateItemContent, deleteItem } = workspaceSlice.actions;
export default workspaceSlice.reducer;

