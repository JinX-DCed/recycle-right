import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faImage, faMapMarkerAlt, faDirections } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

// Types as specified in the requirements
type ChatMsges = {
  type: "text" | "image"; // Whether this message is text or an image
  role: "model" | "user"; // Whether this message is sent by the user or the AI model
  mimeType?: string; // Required if type is "image"
  content: string; // If text, the text message, If image, then the base64 encoded image
  location?: {
    lat: number;
    lng: number;
    name?: string;
  }; // Optional location data
}[];

// Define a type for a single message
type ChatMessage = {
  type: "text" | "image";
  role: "model" | "user";
  mimeType?: string;
  content: string;
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
};

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

const LocationCard = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  overflow: hidden;
`;

const LocationHeader = styled.div`
  background-color: #00a108;
  color: white;
  padding: 10px 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LocationContent = styled.div`
  padding: 12px 16px;
`;

const LocationButton = styled.button`
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
  },
  {
    type: "text",
    role: "model",
    content: "Try asking me about recycling locations with coordinates! For example: 'Where can I recycle near Buona Vista at 1.3107, 103.7901?' or 'Find recycling bins in Tampines'"
  },
  {
    type: "text",
    role: "user",
    content: "Where can I recycle near Buona Vista at 1.3107, 103.7901?"
  },
  {
    type: "text",
    role: "model",
    content: "I found a recycling bin near Buona Vista.",
    location: {
      lat: 1.3107,
      lng: 103.7901,
      name: "Buona Vista"
    }
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
  const navigate = useNavigate();
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to detect location in message
  const detectLocation = (message: string): { lat: number; lng: number; name?: string } | null => {
    // Regular expression to match latitude,longitude patterns
    // This regex looks for patterns like "1.3521, 103.8198" or variations
    const latLngRegex = /(\-?\d+\.\d+),\s*(\-?\d+\.\d+)/;
    const match = message.match(latLngRegex);
    
    if (match && match.length >= 3) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      // Simple validation for Singapore area
      if (lat >= 1.1 && lat <= 1.5 && lng >= 103.5 && lng <= 104.1) {
        // Try to extract a name from the message if it exists
        const nameRegex = /(at|near|in|to)\s+([A-Za-z\s]+)(?=[\.,]|\s+at|\s+near|\s+with|\s+is|\s+has|$)/i;
        const nameMatch = message.match(nameRegex);
        const name = nameMatch ? nameMatch[2].trim() : "This location";
        
        return { lat, lng, name };
      }
    }
    
    return null;
  };

  const handleDirectToLocation = (location: { lat: number; lng: number }) => {
    // Store the location in sessionStorage to pass to the map component
    sessionStorage.setItem('directedLocation', JSON.stringify(location));
    // Close the chat
    onClose();
    // Navigate to the bin map page or open the bin map modal
    // For now, we'll simulate this by logging
    console.log('Directing to location:', location);
    
    // This would typically navigate to your map page:
    navigate('/binmap');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      type: "text" as const,
      role: "user" as const,
      content: inputText
    };
    
    // Check if the message contains a location
    const locationData = detectLocation(inputText);
    if (locationData) {
      userMessage.location = locationData;
    }
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // In a real implementation, you would send the message to your backend API
      // and get a response from the LLM
      // For now, we'll simulate a response
      setTimeout(() => {
        let botResponse: ChatMessage;
        
        // Simulate a response with location if the user message contained one
        if (locationData) {
          botResponse = {
            type: "text" as const,
            role: "model" as const,
            content: `I found a recycling bin near ${locationData.name || 'the coordinates you provided'}.`,
            location: locationData
          };
        } else {
          botResponse = {
            type: "text" as const,
            role: "model" as const,
            content: `I received your message: "${userMessage.content}". This is a placeholder response. In a real implementation, this would be generated by an LLM.`
          };
        }
        
        // Add example location response if user asks about specific areas
        if (userMessage.content.toLowerCase().includes('tampines') || 
            userMessage.content.toLowerCase().includes('east')) {
          // Add a follow-up message with another location
          setTimeout(() => {
            const additionalBotResponse: ChatMessage = {
              type: "text",
              role: "model",
              content: "I also found another recycling point at Tampines Hub you might want to check out.",
              location: {
                lat: 1.3521,
                lng: 103.9455,
                name: "Tampines Hub Recycling Point"
              }
            };
            setMessages(prev => [...prev, additionalBotResponse]);
          }, 1500);
        }
        
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
      const imageMessage: ChatMessage = {
        type: "image" as const,
        role: "user" as const,
        mimeType: file.type,
        content: base64String
      };
      
      setMessages(prev => [...prev, imageMessage]);
      
      // Simulate response to the image
      setIsLoading(true);
      setTimeout(() => {
        const botResponse: ChatMessage = {
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
          <div key={index}>
            <MessageBubble isUser={message.role === 'user'}>
              {message.type === 'text' ? (
                message.content
              ) : (
                <ImageMessage src={message.content} alt="User uploaded image" />
              )}
            </MessageBubble>
            
            {/* Location card if message has location */}
            {message.location && (
              <LocationCard>
                <LocationHeader>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {message.location.name || 'Location Found'}
                </LocationHeader>
                <LocationContent>
                  <div>Latitude: {message.location.lat.toFixed(6)}</div>
                  <div>Longitude: {message.location.lng.toFixed(6)}</div>
                  <LocationButton onClick={() => handleDirectToLocation(message.location!)}>
                    <FontAwesomeIcon icon={faDirections} />
                    Get Directions
                  </LocationButton>
                </LocationContent>
              </LocationCard>
            )}
          </div>
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
          placeholder="Ask about recycling or locations (e.g., 1.3521, 103.8198)..."
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
