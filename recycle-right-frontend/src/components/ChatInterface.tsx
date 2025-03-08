import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faImage,
  faMapMarkerAlt,
  faDirections,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/github.css';
import axios from "axios";

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
  
  & th, & td {
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
  
  & ul, & ol {
    margin: 10px 0;
    padding-left: 20px;
  }
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
  
  &:disabled {
    color: #cccccc;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

// Sample initial message
const initialMessages: ChatMsges = [];

interface ChatInterfaceProps {
  onClose: () => void;
}

// Create a custom axios instance with proper configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

console.log("API Base URL:", API_BASE_URL);

// Log the actual API URL for debugging
console.log("Actual API URL being used:", API_BASE_URL);

// Create a configured axios instance with more verbose logging
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  timeout: 30000, // 30 seconds timeout (increased for debugging)
  withCredentials: false // explicitly disable sending cookies
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Full Request Config:', {
    url: request.url,
    method: request.method,
    baseURL: request.baseURL,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response received successfully:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error: any) => {
    console.error('API error details:', error.message);
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('Error request (no response):', error.request);
    }
    return Promise.reject(error);
  }
);

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMsges>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to detect location in message
  const detectLocation = (
    message: string
  ): { lat: number; lng: number; name?: string } | null => {
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
        const nameRegex =
          /(at|near|in|to)\s+([A-Za-z\s]+)(?=[\.,]|\s+at|\s+near|\s+with|\s+is|\s+has|$)/i;
        const nameMatch = message.match(nameRegex);
        const name = nameMatch ? nameMatch[2].trim() : "This location";

        return { lat, lng, name };
      }
    }

    return null;
  };

  const handleDirectToLocation = (location: { lat: number; lng: number }) => {
    // Store the location in sessionStorage to pass to the map component
    sessionStorage.setItem("directedLocation", JSON.stringify(location));
    // Close the chat
    onClose();
    // Navigate to the bin map page or open the bin map modal
    // For now, we'll simulate this by logging
    console.log("Directing to location:", location);

    // This would typically navigate to your map page:
    navigate("/binmap");
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      type: "text" as const,
      role: "user" as const,
      content: inputText,
    };

    // Check if the message contains a location
    const locationData = detectLocation(inputText);
    if (locationData) {
      userMessage.location = locationData;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Send only the latest user message to the API for processing
      // This simplifies the request and reduces data transfer
      const apiMessages = [
        {
          type: userMessage.type,
          role: userMessage.role,
          content: userMessage.content,
          mimeType: userMessage.mimeType
        }
      ];
      
      // Log the message being sent
      console.log('Sending single message to backend:', {
        type: userMessage.type,
        role: userMessage.role,
        contentLength: userMessage.content.length
      });
      
      // Call the backend API with only the latest message
      console.log("Sending request to: /gemini with the latest user message only");
      
      let response;
      try {
        // First attempt using our configured API instance
        // Ensure we're sending the expected format to match backend ChatMsg[] type
        response = await api.post("/gemini", {
          messages: apiMessages
        });
        console.log("API Response received via instance:", response.status);
      } catch (instanceError: any) {
        console.warn("Error with API instance, trying direct axios call...", instanceError.message);
        
        // Fallback to direct axios call with full URL
        response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/gemini`,
          data: { messages: apiMessages }, // This should match the backend's expected format
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        });
        console.log("API Response received via direct axios:", response.status);
      }
      
      // Parse the response from the backend
      const botResponseText = response.data.nextMsg;
      console.log("Response", response);
      // Create the bot response message
      let botResponse: ChatMessage = {
        type: "text" as const,
        role: "model" as const,
        content: botResponseText,
      };
      
      // Check if the response potentially contains location information
      // This is a basic attempt - in a production app you might want the backend to explicitly return location data
      const possibleLocationData = detectLocation(botResponseText);
      if (possibleLocationData) {
        botResponse.location = possibleLocationData;
      }
      
      setMessages((prev) => [...prev, botResponse]);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      // More detailed error logging
      // Full detailed error logging
      console.error("Error in handleSendMessage:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.response) {
        // The request was made and the server responded with a status code outside the 2xx range
        console.error("Response error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request sent but no response received:", error.request);
        console.log("Network status:", navigator.onLine ? "Online" : "Offline");
        
        // Try a direct fetch as a last resort
        try {
          console.log("Attempting fetch API as last resort...");
          fetch(`${API_BASE_URL}/health`)
            .then(res => console.log("Health check response:", res.status))
            .catch(e => console.error("Even fetch failed:", e));
        } catch (e) {
          console.error("Final fetch attempt failed:", e);
        }
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message || 'Unknown error');
      }
      
      // Add an error message for the user
      const errorMessage: ChatMessage = {
        type: "text",
        role: "model",
        content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64String = reader.result as string;
      
      // Extract the base64 part (remove data:image/jpeg;base64, prefix)
      if (base64String.includes(',')) {
        base64String = base64String.split(',')[1];
      }

      // Add user image message with the full base64 string for display
      const imageMessage: ChatMessage = {
        type: "image" as const,
        role: "user" as const,
        mimeType: file.type,
        content: reader.result as string, // Keep the full string for display
      };

      setMessages((prev) => [...prev, imageMessage]);
      setIsLoading(true);

      try {
        // First, call the image recognition API with our configured axios instance
        console.log("Sending image to: /image/recognise (size: " + base64String.length + " chars)");
        
        let recognitionResponse;
        try {
          // First attempt with API instance
          recognitionResponse = await api.post("/image/recognise", {
            image: base64String
          });
        } catch (instanceError: any) {
          console.warn("Error with API instance for image, trying direct axios call...", instanceError.message);
          
          // Fallback to direct axios call
          recognitionResponse = await axios({
            method: 'post',
            url: `${API_BASE_URL}/image/recognise`,
            data: { image: base64String },
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          });
        }
        
        // Get the recognition result
        const recognitionResult = recognitionResponse.data;
        console.log("recognitionResult", recognitionResult);
        // Format a good message based on the recognition results
        let recognitionMessage = "";
        if (recognitionResult && !recognitionResult.error) {
          // Check if we have name and recyclability info
          if (recognitionResult.name) {
            recognitionMessage = `I identified this as: ${recognitionResult.name}. `;
            
            if (recognitionResult.canBeRecycled !== undefined) {
              recognitionMessage += recognitionResult.canBeRecycled ? 
                "This item can be recycled in Singapore." : 
                "This item cannot be recycled in Singapore.";
            }
          } else {
            // Use raw response if we couldn't parse it properly
            recognitionMessage = `Image recognition result: ${JSON.stringify(recognitionResult)}`;
          }
        } else {
          // Handle error case
          recognitionMessage = recognitionResult.error || "Sorry, I couldn't analyze this image properly.";
        }
        
        // Now send the image to the chat API with the recognition result as context
        // Only include the image and a follow-up question - no message history needed
        const apiMessages = [
          {
            type: "image" as const,
            role: "user" as const,
            mimeType: file.type,
            content: base64String
          }, 
          {
            type: "text" as const,
            role: "user" as const,
            content: "What is in this image and is it recyclable in Singapore?"
          }
        ];
        
        const botResponseToImage: ChatMessage = {
          type: "text" as const,
          role: "model" as const,
          content: recognitionMessage
        };
        setMessages((prev) => [...prev, botResponseToImage]);

        // Call the Gemini API with fallback mechanism
        let response;
        try {
          response = await api.post("/gemini", {
            messages: apiMessages
          });
        } catch (instanceError: any) {
          console.warn("Error with API instance for image-related text, trying direct axios call...", instanceError.message);
          
          // Fallback to direct axios call
          response = await axios({
            method: 'post',
            url: `${API_BASE_URL}/gemini`,
            data: { messages: apiMessages },
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          });
        }
        
        // Get the bot's response
        const botResponse: ChatMessage = {
          type: "text" as const,
          role: "model" as const,
          content: response.data.nextMsg || recognitionMessage
        };
        
        setMessages((prev) => [...prev, botResponse]);
      } catch (error: any) {
        console.error("Error processing image:", error);
        // More detailed error logging
        if (error.response) {
          console.error("Response error:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("Request error - no response received");
        } else {
          console.error("Request setup error:", error.message || 'Unknown error');
        }
        
        // Add an error message for the user
        const errorMessage: ChatMessage = {
          type: "text",
          role: "model",
          content: "Sorry, I had trouble processing your image. Please try again later.",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsDataURL(file);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((message, index) => (
          <div key={index}>
            <MessageBubble isUser={message.role === "user"}>
              {message.type === "text" ? (
                <Markdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeHighlight]}
                >
                  {message.content}
                </Markdown>
              ) : (
                <ImageMessage src={message.content} alt="User uploaded image" />
              )}
            </MessageBubble>

            {/* Location card if message has location */}
            {message.location && (
              <LocationCard>
                <LocationHeader>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {message.location.name || "Location Found"}
                </LocationHeader>
                <LocationContent>
                  <div>Latitude: {message.location.lat.toFixed(6)}</div>
                  <div>Longitude: {message.location.lng.toFixed(6)}</div>
                  <LocationButton
                    onClick={() => handleDirectToLocation(message.location!)}
                  >
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
        <ImageButton onClick={handleImageUpload} disabled={isLoading}>
          <FontAwesomeIcon icon={faImage} />
        </ImageButton>
        <FileInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          disabled={isLoading}
        />
        <MessageInput
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about recycling or locations (e.g., 1.3521, 103.8198)..."
          disabled={isLoading}
        />
        <SendButton
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faPaperPlane} />
          )}
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;
