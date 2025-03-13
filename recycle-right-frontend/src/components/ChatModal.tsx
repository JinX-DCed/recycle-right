import React from "react";
import styled from "styled-components";
import ChatInterface from "./ChatInterface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { BackButton } from "./BackButton";

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
  background-color: #fffef7;
  width: 100%;
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
  background-color: #b9c9bf;
  color: white;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  margin: 0;
  padding: 8px;
`;

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
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
              src={require("./logo.png")}
              alt="logo"
              style={{ maxWidth: "15%", marginRight: "10px" }}
            />
            Trashtalker
          </Title>
        </ModalHeader>
        <ChatInterface onClose={onClose} />
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChatModal;
