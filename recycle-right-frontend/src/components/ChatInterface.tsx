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
import "highlight.js/styles/github.css";
import axios from "axios";
import {
  ChatContainer,
  MenuContainer,
  MenuTitle,
  ButtonGrid,
  MenuButton,
  MessagesContainer,
  MessageBubble,
  ImageMessage,
  LocationCard,
  LocationHeader,
  LocationContent,
  LocationButton,
  InputContainer,
  ImageButton,
  FileInput,
  MessageInput,
  SendButton,
  QuickOptionsMenu,
  QuickOption,
} from "./ChatComponents";

// Types as specified in the requirements
type ChatMsges = ChatMessage[];

// Define a type for a single message
type ChatMessage = {
  type: "text" | "image"; // Whether this message is text or an image
  role: "model" | "user"; // Whether this message is sent by the user or the AI model
  mimeType?: string; // Required if type is "image"
  content: string; // If text, the text message, If image, then the base64 encoded image
  location?: {
    lat: number;
    lng: number;
    name?: string;
  }; // Optional location data
};

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
    Accept: "application/json",
  },
  timeout: 30000, // 30 seconds timeout (increased for debugging)
  withCredentials: false, // explicitly disable sending cookies
});

// Add request interceptor for debugging
api.interceptors.request.use((request) => {
  console.log("Full Request Config:", {
    url: request.url,
    method: request.method,
    baseURL: request.baseURL,
    headers: request.headers,
    data: request.data,
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("Response received successfully:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
    return response;
  },
  (error: any) => {
    console.error("API error details:", error.message);
    if (error.response) {
      console.error("Error response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Error request (no response):", error.request);
    }
    return Promise.reject(error);
  }
);

const makeChatMsg = (
  content: string,
  role: "model" | "user",
  type: "text" | "image",
  mimeType?: string
): ChatMessage => {
  return {
    type,
    role,
    content,
    mimeType,
  };
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMsges>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (messages.length > 0) {
      setShowMenu(false);
    }
  }, [messages]);

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

  const sendMessage = async (userMessage: ChatMessage) => {
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
          mimeType: userMessage.mimeType,
        },
      ];

      // Log the message being sent
      console.log("Sending single message to backend:", {
        type: userMessage.type,
        role: userMessage.role,
        contentLength: userMessage.content.length,
      });

      // Call the backend API with only the latest message
      console.log(
        "Sending request to: /gemini with the latest user message only"
      );

      let response;
      try {
        // First attempt using our configured API instance
        // Ensure we're sending the expected format to match backend ChatMsg[] type
        response = await api.post("/gemini", {
          messages: apiMessages,
        });
        console.log("API Response received via instance:", response.status);
      } catch (instanceError: any) {
        console.warn(
          "Error with API instance, trying direct axios call...",
          instanceError.message
        );

        // Fallback to direct axios call with full URL
        response = await axios({
          method: "post",
          url: `${API_BASE_URL}/gemini`,
          data: { messages: apiMessages }, // This should match the backend's expected format
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
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
        name: error.name,
      });

      if (error.response) {
        // The request was made and the server responded with a status code outside the 2xx range
        console.error("Response error details:", {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request sent but no response received:", error.request);
        console.log("Network status:", navigator.onLine ? "Online" : "Offline");

        // Try a direct fetch as a last resort
        try {
          console.log("Attempting fetch API as last resort...");
          fetch(`${API_BASE_URL}/health`)
            .then((res) => console.log("Health check response:", res.status))
            .catch((e) => console.error("Even fetch failed:", e));
        } catch (e) {
          console.error("Final fetch attempt failed:", e);
        }
      } else {
        // Something happened in setting up the request
        console.error("Request setup error:", error.message || "Unknown error");
      }

      // Add an error message for the user
      const errorMessage = makeChatMsg(
        "Sorry, I'm having trouble connecting to the server. Please try again later.",
        "model",
        "text"
      );
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
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

    sendMessage(userMessage);
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
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64String = reader.result as string;

      // Extract the base64 part (remove data:image/jpeg;base64, prefix)
      if (base64String.includes(",")) {
        base64String = base64String.split(",")[1];
      }

      // Add user image message with the full base64 string for display
      const imageMessage = makeChatMsg(
        reader.result as string, // Keep the full string for display
        "user",
        "image",
        file.type
      );
      setMessages((prev) => [...prev, imageMessage]);
      setIsLoading(true);

      try {
        // Now send the image to the chat API with the recognition result as context
        // Only include the image and a follow-up question - no message history needed
        const apiMessages = [
          {
            type: "image" as const,
            role: "user" as const,
            mimeType: file.type,
            content: base64String,
          },
          {
            type: "text" as const,
            role: "user" as const,
            content: "What is in this image and is it recyclable in Singapore?",
          },
        ];

        // Call the Gemini API with fallback mechanism
        let response;
        try {
          response = await api.post("/gemini", {
            messages: apiMessages,
          });
        } catch (instanceError: any) {
          console.warn(
            "Error with API instance for image-related text, trying direct axios call...",
            instanceError.message
          );

          // Fallback to direct axios call
          response = await axios({
            method: "post",
            url: `${API_BASE_URL}/gemini`,
            data: { messages: apiMessages },
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          });
        }

        // Get the bot's response
        const botResponse = makeChatMsg(response.data.nextMsg, "model", "text");
        setMessages((prev) => [...prev, botResponse]);
      } catch (error: any) {
        console.error("Error processing image:", error);
        // More detailed error logging
        if (error.response) {
          console.error(
            "Response error:",
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          console.error("Request error - no response received");
        } else {
          console.error(
            "Request setup error:",
            error.message || "Unknown error"
          );
        }

        // Add an error message for the user
        const errorMessage = makeChatMsg(
          "Sorry, I had trouble processing your image. Please try again later.",
          "model",
          "text"
        );
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

  // Get the content of the button and set it in messages. The argument should be of type MouseEvent<HTMLButtonElement>
  const handleMenuButtonTap = (e: React.MouseEvent<HTMLButtonElement>) => {
    const userMessage: ChatMessage = {
      type: "text",
      role: "user",
      content: e.currentTarget.textContent || "",
    };
    sendMessage(userMessage);
    setShowMenu(false);
  };

  return (
    <ChatContainer>
      {showMenu ? (
        <MenuContainer>
          <MenuTitle>Hey, what can I help you with today?</MenuTitle>
          <ButtonGrid>
            <MenuButton onClick={handleMenuButtonTap}>
              Nearest recycling bin or station
            </MenuButton>
            <MenuButton onClick={handleMenuButtonTap}>
              Tell me if this can be recycled
            </MenuButton>
            <MenuButton onClick={handleMenuButtonTap}>
              Report an issue
            </MenuButton>
            <MenuButton onClick={handleMenuButtonTap}>
              Drop a recycling fact
            </MenuButton>
          </ButtonGrid>
        </MenuContainer>
      ) : (
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
                  <ImageMessage
                    src={message.content}
                    alt="User uploaded image"
                  />
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
      )}

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
