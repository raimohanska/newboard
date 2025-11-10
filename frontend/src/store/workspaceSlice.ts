import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
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
  startSelectionBox,
  updateSelectionBox,
  endSelectionBox,
  setZoom,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;

