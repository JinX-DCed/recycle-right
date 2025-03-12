import styled from "styled-components";

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 20px;
  height: 100%;
`;

export const MenuTitle = styled.h2`
  color: #00a108;
  text-align: center;
  margin: 0;
`;

export const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
`;

export const MenuButton = styled.button`
  background-color: #00a108;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  text-align: center;

  &:hover {
    background-color: #008c06;
  }
`;

export const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${(props) => (props.isUser ? "#dcf8c6" : "#f0f0f0")};
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
  word-break: break-word;

  /* Markdown styling */
  & pre {
    background-color: #f1f1f1;
    border-radius: 6px;
    padding: 12px;
    overflow-x: auto;
  }

  & code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
  }

  & table {
    border-collapse: collapse;
    margin: 10px 0;
    width: 100%;
  }

  & th,
  & td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  & th {
    background-color: #f2f2f2;
    text-align: left;
  }

  & blockquote {
    margin: 0;
    padding-left: 10px;
    border-left: 3px solid #ccc;
    color: #666;
  }

  & img {
    max-width: 100%;
    height: auto;
  }

  & a {
    color: #00a108;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  & ul,
  & ol {
    margin: 10px 0;
    padding-left: 20px;
  }
`;

export const ImageMessage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
`;

export const LocationCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  overflow: hidden;
`;

export const LocationHeader = styled.div`
  background-color: #00a108;
  color: white;
  padding: 10px 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const LocationContent = styled.div`
  padding: 12px 16px;
`;

export const LocationButton = styled.button`
  background-color: #00a108;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-top: 12px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #008c06;
  }
`;

// Small menu above input that contains a list of options for the user to select from, each option has an icon and a label
export const QuickOptionsMenu = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  overflow-x: auto;
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
`;

export const QuickOption = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  background-color: white;
  color: #00a108;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f0f8f0;
    border-color: #00a108;
  }

  & svg {
    font-size: 12px;
  }
`;

export const InputContainer = styled.div`
  display: flex;
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
`;

export const MessageInput = styled.input`
  flex-grow: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  outline: none;
  font-size: 16px;

  &:focus {
    border-color: #00a108;
  }
`;

export const SendButton = styled.button`
  background: #00a108;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  margin-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

export const ImageButton = styled.button`
  background: none;
  border: none;
  color: #00a108;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

export const FileInput = styled.input`
  display: none;
`;
