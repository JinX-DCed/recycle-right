import styled from 'styled-components';
import React, { useState } from 'react';
import Modal from './Modal';

const ActivityContainer = styled.div`
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
`;

const Button = styled.button`
  background-color: #00a108;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #008a06;
  }
`;

const List = styled.ul`
  margin-top: 12px;
  list-style-type: none;
  padding: 0;
`;

const ChallengeItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const Challenges = () => {
  return (
    <List>
      <ChallengeItem>
        <Checkbox type="checkbox" name="challenge" />
        Recycle 1 item <span>20pts</span>
      </ChallengeItem>
      <ChallengeItem>
        <Checkbox type="checkbox" name="challenge" />
        Read an article <span>5pts</span>
      </ChallengeItem>
      <ChallengeItem>
        <Checkbox type="checkbox" name="challenge" />
        Recycle 3 types of items <span>1/3</span>
      </ChallengeItem>
      <ChallengeItem>
        <Checkbox type="checkbox" checked />
        Share progress on socials <span>2pts</span>
      </ChallengeItem>
    </List>
  );
};

const RecordsContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-top: 12px;
`;

const RecordItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f0f0f0;
  }
`;

const RecordDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const RecordDate = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const RecordPoints = styled.span`
  font-weight: bold;
  color: #00a108;
`;

const ExpandableContent = styled.div`
  display: none; /* Initially hidden */
  padding: 8px 0;
  margin-top: 8px;
  border-top: 1px solid #e0e0e0;
`;

const Records = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const records = [
    {
      date: '13 Feb 2025, 06:00pm',
      points: 60,
      items: ['Jam jar', 'Cardboard box', 'iPhone'],
    },
    {
      date: '12 Feb 2025, 05:00pm',
      points: 60,
      items: ['Plastic bottle', 'Old newspaper'],
    },
  ];

  const historicalRecords = [
    { date: '10 Feb 2025', points: 30 },
    { date: '09 Feb 2025', points: 50 },
  ];

  const handleToggle = (index: number) => {
    const content = document.getElementById(`expandable-${index}`);
    if (content) {
      content.style.display = content.style.display === 'block' ? 'none' : 'block';
    }
  };

  return (
    <RecordsContainer>
      {records.map((record, index) => (
        <div key={index}>
          <RecordItem onClick={() => handleToggle(index)}>
            <RecordDetails>
              <RecordDate>{record.date}</RecordDate>
              <RecordPoints>{record.points}pts</RecordPoints>
            </RecordDetails>
            <span>{record.items.length} items</span>
          </RecordItem>
          <ExpandableContent id={`expandable-${index}`}>
            {record.items.map((item, itemIndex) => (
              <div key={itemIndex} style={{ paddingLeft: '20px' }}>
                {item}
              </div>
            ))}
          </ExpandableContent>
        </div>
      ))}
      <div 
        style={{ textAlign: 'center', marginTop: '12px', color: '#007bff', cursor: 'pointer' }} 
        onClick={() => setIsModalOpen(true)}
      >
        See all records
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3>Historical Records</h3>
        <ul>
          {historicalRecords.map((record, index) => (
            <li key={index}>
              {record.date}: {record.points}pts
            </li>
          ))}
        </ul>
      </Modal>
    </RecordsContainer>
  );
};

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
  