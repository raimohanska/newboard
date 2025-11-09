import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, CanvasItem } from '../types';
import { loadWorkspace } from '../utils/storage';

interface WorkspaceState extends Workspace {
  selectedIds: string[];
  selectionBox: {
    isActive: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  zoom: number;
  dragOffset: {
    x: number;
    y: number;
  } | null;
}

const loadedWorkspace = loadWorkspace();

const initialState: WorkspaceState = {
  items: loadedWorkspace?.items || {},
  selectedIds: [],
  selectionBox: {
    isActive: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  },
  zoom: 1,
  dragOffset: null,
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
      if (!state.dragOffset) {
        state.dragOffset = { x: 0, y: 0 };
      }
      state.dragOffset.x += delta.x;
      state.dragOffset.y += delta.y;
    },
    commitDrag: (state: WorkspaceState) => {
      if (state.dragOffset) {
        state.selectedIds.forEach(id => {
          const item = state.items[id];
          if (item) {
            item.position.x += state.dragOffset!.x;
            item.position.y += state.dragOffset!.y;
          }
        });
        state.dragOffset = null;
      }
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
    startSelectionBox: (state: WorkspaceState, action: PayloadAction<{ x: number; y: number }>) => {
      state.selectionBox.isActive = true;
      state.selectionBox.startX = action.payload.x;
      state.selectionBox.startY = action.payload.y;
      state.selectionBox.endX = action.payload.x;
      state.selectionBox.endY = action.payload.y;
    },
    updateSelectionBox: (state: WorkspaceState, action: PayloadAction<{ x: number; y: number }>) => {
      state.selectionBox.endX = action.payload.x;
      state.selectionBox.endY = action.payload.y;
    },
    endSelectionBox: (state: WorkspaceState) => {
      state.selectionBox.isActive = false;
    },
    setZoom: (state: WorkspaceState, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.1, Math.min(5, action.payload));
    },
  },
});

export const { 
  createItem, 
  moveItem, 
  moveSelectedItems,
  commitDrag,
  updateItemContent, 
  deleteItem,
  selectItem,
  toggleSelection,
  clearSelection,
  selectMultipleItems,
  bulkCreateItems,
  startSelectionBox,
  updateSelectionBox,
  endSelectionBox,
  setZoom,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;

