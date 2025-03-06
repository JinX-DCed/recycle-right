import styled from 'styled-components';
import { useState } from 'react';
import ChatModal from './ChatModal';

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5); // Semi-transparent background
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DropdownMenu = styled.div`
  background-color: white;
  color: black;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 2;
  border-radius: 8px;
  padding: 16px;
  width: 300px;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const Header = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	const handleOpenChat = () => {
		setIsOpen(false); // Close dropdown
		setIsChatOpen(true); // Open chat modal
	};

	const handleCloseChat = () => {
		setIsChatOpen(false);
	};

	return (
		<>
			<Navbar>
				<div>Recycle Right</div>
				<div style={{ position: 'relative' }}>
					<HamburgerButton onClick={toggleDropdown}>
						&#9776;
					</HamburgerButton>
					{isOpen && (
						<ModalOverlay onClick={() => setIsOpen(false)}>
							<DropdownMenu onClick={(e) => e.stopPropagation()}>
								<DropdownItem onClick={handleOpenChat}>Chat with assistant</DropdownItem>
								<DropdownItem>Option 1</DropdownItem>
								<DropdownItem>Option 2</DropdownItem>
								<DropdownItem>Option 3</DropdownItem>
							</DropdownMenu>
						</ModalOverlay>
					)}
				</div>
			</Navbar>
			<ChatModal isOpen={isChatOpen} onClose={handleCloseChat} />
		</>
	);
};

export default Header;