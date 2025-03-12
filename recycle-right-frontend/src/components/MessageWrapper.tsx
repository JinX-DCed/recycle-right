import React from 'react';
import styled from 'styled-components';

// Message wrapper component to control alignment
const StyledWrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  max-width: 80%;
  margin-bottom: 8px;
`;

interface MessageWrapperProps {
  isUser: boolean;
  children: React.ReactNode;
}

const MessageWrapper: React.FC<MessageWrapperProps> = ({ isUser, children }) => {
  return <StyledWrapper isUser={isUser}>{children}</StyledWrapper>;
};

export default MessageWrapper;
