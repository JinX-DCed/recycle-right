import React, { useContext } from "react";
import styled from "styled-components";
import BinMap from "./BinMap";
import { RecycleRightContext } from "../App";

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
  background-color: white;
  width: 90%;
  max-width: 28rem; /* Match the App container width */
  height: 80vh;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  margin: 0 auto; /* Center the modal */
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #006647;
  margin: 0;
`;

interface BinMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BinMapModal: React.FC<BinMapModalProps> = ({ isOpen, onClose }) => {
  // Access the mapboxToken from context
  const { mapboxToken } = useContext(RecycleRightContext);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>Recycling Bins in Singapore</Title>
        </ModalHeader>
        <BinMap onClose={onClose} mapboxToken={mapboxToken} />
      </ModalContent>
    </ModalOverlay>
  );
};

export default BinMapModal;
