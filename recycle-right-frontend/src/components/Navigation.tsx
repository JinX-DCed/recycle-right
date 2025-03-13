import styled from 'styled-components';
import { useState } from 'react';
import BinMapModal from './BinMapModal';
import ResourcesModal from './ResourcesModal';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faMap, faChartBar } from '@fortawesome/free-solid-svg-icons';

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 16px;
`;

const NavButton = styled.button`
  background-color: #FFF8F0; /* Green background */
  color: black; /* White text */
  border: none; /* No border */
  border-radius: 20px; /* Rounded corners */
  padding: 20px; /* Equal padding for a square shape */
  margin: 5px; /* Margin between buttons */
  margin-bottom: 30px;
  font-size: 16px; /* Font size */
  display: flex; /* Flexbox for icon and text */
  align-items: center; /* Center items vertically */
  cursor: pointer; /* Pointer cursor on hover */
  transition: background-color 0.3s; /* Smooth transition for hover effect */
  font-weight: bold;
  height: 120px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow effect */

  &:hover {
    background-color: #45a049; /* Darker green on hover */
  }

  & > svg {
    margin-right: 8px; /* Space between icon and text */
    color: #FFD700; /* Gold color for icons */
  }
`;

const Navigation = () => {
  const [isBinMapOpen, setIsBinMapOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenBinMap = () => {
    setIsBinMapOpen(true);
  };

  const handleCloseBinMap = () => {
    setIsBinMapOpen(false);
  };

  const handleOpenResources = () => {
    setIsResourcesOpen(true);
  };

  const handleCloseResources = () => {
    setIsResourcesOpen(false);
  };
  
  const handleNavigateToStatistics = () => {
    navigate('/statistics');
  };

  return (
    <>
      <NavigationContainer>
        <NavButton onClick={handleOpenResources}>
          {/* <FontAwesomeIcon icon={faBook} />  */}
          Resources
        </NavButton>
        <NavButton onClick={handleOpenBinMap}>
          {/* <FontAwesomeIcon icon={faMap} />  */}
          Bin map
        </NavButton>
        <NavButton onClick={handleNavigateToStatistics}>
          Statistics
        </NavButton>
      </NavigationContainer>

      <BinMapModal isOpen={isBinMapOpen} onClose={handleCloseBinMap} />
      <ResourcesModal isOpen={isResourcesOpen} onClose={handleCloseResources} />
    </>
  );
};
  
export default Navigation;
