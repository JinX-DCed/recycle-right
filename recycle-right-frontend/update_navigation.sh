#!/bin/bash

# Update Navigation.tsx to add statistics navigation functionality
cat > ./src/components/Navigation.tsx << 'EOL'
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faMap, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import BinMapModal from './BinMapModal';
import ResourcesModal from './ResourcesModal';
import { useNavigate } from 'react-router-dom';

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
`;

const NavButton = styled.button`
  background-color: #4CAF50; /* Green background */
  color: white; /* White text */
  border: none; /* No border */
  border-radius: 5px; /* Rounded corners */
  padding: 10px 15px; /* Padding */
  margin: 5px; /* Margin between buttons */
  font-size: 16px; /* Font size */
  display: flex; /* Flexbox for icon and text */
  align-items: center; /* Center items vertically */
  cursor: pointer; /* Pointer cursor on hover */
  transition: background-color 0.3s; /* Smooth transition for hover effect */

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
          <FontAwesomeIcon icon={faBook} /> Resources
        </NavButton>
        <NavButton onClick={handleOpenBinMap}>
          <FontAwesomeIcon icon={faMap} /> Bin map
        </NavButton>
        <NavButton onClick={handleNavigateToStatistics}>
          <FontAwesomeIcon icon={faChartBar} /> Statistics
        </NavButton>
      </NavigationContainer>

      <BinMapModal isOpen={isBinMapOpen} onClose={handleCloseBinMap} />
      <ResourcesModal isOpen={isResourcesOpen} onClose={handleCloseResources} />
    </>
  );
};
  
export default Navigation;
EOL

# Update App.tsx to include the StatisticsPage route
# First line (import)
sed -i '' '1,20s/import SubmitLogs from "\.\/pages\/SubmitLogs";/import SubmitLogs from "\.\/pages\/SubmitLogs";\nimport StatisticsPage from "\.\/pages\/StatisticsPage";/' ./src/App.tsx

# Add route
sed -i '' 's/<Route path="\/submitLogs" element={<SubmitLogs \/>} \/>/<Route path="\/submitLogs" element={<SubmitLogs \/>} \/>\n          <Route path="\/statistics" element={<StatisticsPage \/>} \/>/' ./src/App.tsx

echo "Updates completed!"
