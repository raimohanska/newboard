import { Workspace } from '../types';

const STORAGE_KEY = 'newboard-workspace';

export const loadWorkspace = (): Workspace | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load workspace from localStorage:', error);
    return null;
  }
};

export const saveWorkspace = (workspace: Workspace): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch (error) {
    console.error('Failed to save workspace to localStorage:', error);
  }
};

