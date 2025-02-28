import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: #006647; /* Tailwind's blue-500 */
  color: white; /* Text color */
  width: 100%;
  padding: 12px; /* Adjusted padding for better appearance */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow */
  font-size: 18px; /* Font size */
  font-weight: 600; /* Bold font weight */
  transition: background-color 0.3s, transform 0.2s; /* Smooth transitions */

  &:hover {
    background-color: #25eb92; /* Darker blue on hover */
    transform: translateY(-2px); /* Slight lift effect */
  }

  &:active {
    transform: translateY(0); /* Reset lift effect on click */
  }
`;

interface ButtonProps {
    text: string;
    onClick?: () => void;
  }
  
  const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
    return (
      <StyledButton
        onClick={onClick}
      >
        {text}
      </StyledButton>
    );
  };
  
  export default Button;
  