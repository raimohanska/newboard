import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  selectedIds: string[];
  selectionBox: {
    isActive: boolean;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
  zoom: number;
}

const initialState: WorkspaceState = {
  selectedIds: [],
  selectionBox: {
    isActive: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  },
  zoom: 1,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
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
  selectItem,
  toggleSelection,
  clearSelection,
  selectMultipleItems,
  startSelectionBox,
  updateSelectionBox,
  endSelectionBox,
  setZoom,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;

