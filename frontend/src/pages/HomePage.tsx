import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f5f5f5;
`;

const Title = styled.h1`
  font-size: 48px;
  color: #333;
  margin-bottom: 32px;
`;

const Button = styled.button`
  padding: 16px 32px;
  font-size: 18px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #357abd;
  }

  &:active {
    background: #2868a8;
  }
`;

function generateWorkspaceId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const HomePage = () => {
  const navigate = useNavigate();

  const handleCreateWorkspace = () => {
    const workspaceId = generateWorkspaceId();
    navigate(`/w/${workspaceId}`);
  };

  // Auto-redirect to a new workspace
  useEffect(() => {
    const workspaceId = generateWorkspaceId();
    navigate(`/w/${workspaceId}`);
  }, [navigate]);

  return (
    <HomeContainer>
      <Title>Newboard</Title>
      <Button onClick={handleCreateWorkspace}>Create New Workspace</Button>
    </HomeContainer>
  );
};

