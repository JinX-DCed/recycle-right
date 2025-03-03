import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faImage } from '@fortawesome/free-solid-svg-icons';

// Types as specified in the requirements
type ChatMsges = {
  type: "text" | "image"; // Whether this message is text or an image
  role: "model" | "user"; // Whether this message is sent by the user or the AI model
  mimeType?: string; // Required if type is "image"
  content: string; // If text, the text message, If image, then the base64 encoded image
}[];

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${props => props.isUser ? '#dcf8c6' : '#f0f0f0'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  word-break: break-word;
`;

const ImageMessage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
`;

const InputContainer = styled.div`
  display: flex;
  padding: 12px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
`;

const MessageInput = styled.input`
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

const SendButton = styled.button`
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

const ImageButton = styled.button`
  background: none;
  border: none;
  color: #00a108;
  margin-right: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const FileInput = styled.input`
  display: none;
`;

// Sample initial message
const initialMessages: ChatMsges = [
  {
    type: "text",
    role: "model",
    content: "Hello! I'm your recycling assistant. How can I help you today?"
  }
];

interface ChatInterfaceProps {
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMsges>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() && isLoading) return;
    
    // Add user message
    const userMessage = {
      type: "text" as const,
      role: "user" as const,
      content: inputText
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // In a real implementation, you would send the message to your backend API
      // and get a response from the LLM
      // For now, we'll simulate a response
      setTimeout(() => {
        const botResponse = {
          type: "text" as const,
          role: "model" as const,
          content: `I received your message: "${userMessage.content}". This is a placeholder response. In a real implementation, this would be generated by an LLM.`
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // Add user image message
      const imageMessage = {
        type: "image" as const,
        role: "user" as const,
        mimeType: file.type,
        content: base64String
      };
      
      setMessages(prev => [...prev, imageMessage]);
      
      // Simulate response to the image
      setIsLoading(true);
      setTimeout(() => {
        const botResponse = {
          type: "text" as const,
          role: "model" as const,
          content: "I received your image. This is a placeholder response. In a real implementation, the LLM would analyze the image and provide a relevant response."
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
      }, 1500);
    };
    
    reader.readAsDataURL(file);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((message, index) => (
          <MessageBubble key={index} isUser={message.role === 'user'}>
            {message.type === 'text' ? (
              message.content
            ) : (
              <ImageMessage src={message.content} alt="User uploaded image" />
            )}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <ImageButton onClick={handleImageUpload}>
          <FontAwesomeIcon icon={faImage} />
        </ImageButton>
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*"
        />
        <MessageInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <SendButton onClick={handleSendMessage} disabled={!inputText.trim() || isLoading}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;
