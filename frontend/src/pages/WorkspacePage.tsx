import { useParams, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';
import App from '../App';

export const WorkspacePage = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  if (!workspaceId) {
    return <Navigate to="/" replace />;
  }

  return (
    <WorkspaceProvider workspaceId={workspaceId}>
      <App />
    </WorkspaceProvider>
  );
};

