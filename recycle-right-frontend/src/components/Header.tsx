import styled from 'styled-components';

const Navbar = styled.div`
  background-color: #00a108; 
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  &:focus {
    outline: none;
  }
`;

const Header = () => {
    return (
      <Navbar>
        <div>Points and name</div>
        <HamburgerButton>
          &#9776; 
        </HamburgerButton>
      </Navbar>
    );
};

export default Header;
  