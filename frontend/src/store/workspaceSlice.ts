import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkspaceState {
  zoom: number;
}

const initialState: WorkspaceState = {
  zoom: 1,
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setZoom: (state: WorkspaceState, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.1, Math.min(5, action.payload));
    },
  },
});

export const { 
  setZoom,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;

