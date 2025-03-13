import React from "react";
import styled from "styled-components";
import ChatInterface from "./ChatInterface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color:#fffef7;
  width: 90%;
  max-width: 450px;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 16px;
  background-color: #B9C9BF;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  margin: 0;
  padding: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;

  &:focus {
    outline: none;
  }
`;

const BackButton = styled.div`
  /* background-color: #8390FA; */
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s;
`;
  
const IconContainer = styled.div`
  flex: 0 0 10%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const handleBack = () => {
    onClose();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={handleContentClick}>
        <ModalHeader>
          <BackButton onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </BackButton>
          <Title>
            <img
              src={require('./logo.png')}
              alt="logo"
              style={{ maxWidth: "15%", marginRight:"10px" }}
            />
            Trashtalker
          </Title>
          <CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </ModalHeader>
        <ChatInterface onClose={onClose} />
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChatModal;
