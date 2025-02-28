import styled from 'styled-components';

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const NavButton = styled.button`
  background-color: #e5e7eb; 
  width: 30%; 
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  font-weight: 500;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #d1d5db;
    transform: scale(1.05);
  }
`;

const Navigation = () => {
    return (
      <NavigationContainer>
        <NavButton>Resources</NavButton>
        <NavButton>Bin map</NavButton>
        <NavButton>Statistics</NavButton>
      </NavigationContainer>
    );
  };
  
  export default Navigation;
  