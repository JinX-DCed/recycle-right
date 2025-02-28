import styled from 'styled-components';
import React, { useState } from 'react';

const ActivityContainer = styled.div`
  padding: 16px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Button = styled.button`
  background-color: #e5e7eb;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #d1d5db;
  }
`;

const List = styled.ul`
  margin-top: 12px;
  list-style-type: none;
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
`;

// Define the new components
const Challenges = () => (
  <div> 
    <h3>Challenges Component</h3>
  </div>
);

const Records = () => (
  <div> 
    <h3>Records Component</h3>
  </div>
);

const Activity = () => {
  const [activeComponent, setActiveComponent] = useState<'challenges' | 'records'>('challenges');

  return (
    <ActivityContainer>
      <Title>Your Activity</Title>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <Button onClick={() => setActiveComponent('challenges')}>Challenges</Button>
        <Button onClick={() => setActiveComponent('records')}>Records</Button>
      </div>
      <List>
        {activeComponent === 'challenges' && <Challenges />}
        {activeComponent === 'records' && <Records />}
      </List>
    </ActivityContainer>
  );
};

export default Activity;
  