import { createContext, useContext, ReactNode } from 'react';
import { getItemStore, ItemStore } from '../store/ItemStore';

interface WorkspaceContextValue {
  workspaceId: string;
  itemStore: ItemStore;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

interface WorkspaceProviderProps {
  workspaceId: string;
  children: ReactNode;
}

export const WorkspaceProvider = ({ workspaceId, children }: WorkspaceProviderProps) => {
  const itemStore = getItemStore(workspaceId);

  return (
    <WorkspaceContext.Provider value={{ workspaceId, itemStore }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextValue => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

