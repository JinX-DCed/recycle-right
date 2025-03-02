import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faMap, faChartBar } from '@fortawesome/free-solid-svg-icons';

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
    return (
      <NavigationContainer>
        <NavButton>
          <FontAwesomeIcon icon={faBook} /> Resources
        </NavButton>
        <NavButton>
          <FontAwesomeIcon icon={faMap} /> Bin map
        </NavButton>
        <NavButton>
          <FontAwesomeIcon icon={faChartBar} /> Statistics
        </NavButton>
      </NavigationContainer>
    );
  };
  
  export default Navigation;
  