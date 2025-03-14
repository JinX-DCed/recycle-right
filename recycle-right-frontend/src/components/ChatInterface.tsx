import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faImage,
  faMapMarkerAlt,
  faDirections,
  faSpinner,
  faCirclePlus,
  faLocationDot,
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
  LocationButton,
  InputContainer,
  ImageButton,
  FileInput,
  MessageInput,
  SendButton,
  QuickOptionsMenu,
  QuickOption,
} from "./ChatComponents";
import { SESSION_STORAGE_NAMES } from "./constants";

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

export type Coords = {
  lat: number;
  lng: number;
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
  mimeType?: string,
  location?: {
    lat: number;
    lng: number;
    name?: string;
  }
): ChatMessage => {
  return {
    type,
    role,
    content,
    mimeType,
    location,
  };
};

const setLocationInSessionStorage = (name: string, location: Coords) => {
  const currentLocations = sessionStorage.getItem(
    SESSION_STORAGE_NAMES.OVERALL
  );
  if (currentLocations) {
    const sessionLocation = JSON.parse(currentLocations);
    sessionStorage.setItem(
      SESSION_STORAGE_NAMES.OVERALL,
      JSON.stringify({ ...sessionLocation, [name]: location })
    );
  } else {
    sessionStorage.setItem(
      SESSION_STORAGE_NAMES.OVERALL,
      JSON.stringify({ [name]: location })
    );
  }
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMsges>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(true);
  const [showQuickOptions, setShowQuickOptions] = useState(false);
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

  // Callback to get user's current location in terms of longitude and latitude
  const getCurrentLocation = (): Promise<Coords> => {
    setIsLoading(true);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        setMessages((prev) => [
          ...prev,
          makeChatMsg(
            "Geolocation is not supported by your browser",
            "model",
            "text"
          ),
        ]);
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setIsLoading(false);
          reject(new Error(`Error getting location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    });
  };

  const handleDirectToLocation = (destinationLocation: Coords) => {
    // Store the location in sessionStorage to pass to the map component
    setLocationInSessionStorage(
      SESSION_STORAGE_NAMES.DESTINATION_LOCATION,
      destinationLocation
    );
    // Close the chat
    onClose();
    // Navigate to the bin map page or open the bin map modal
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

      try {
        const locationsObj = JSON.parse(botResponseText);
        if (locationsObj.locations) {
          const nearestBin = locationsObj.locations[0];
          const resMsg = makeChatMsg(
            `The nearest recycling bin to you is ${nearestBin.distance}m away. Tap the button to see it on the map!`,
            "model",
            "text",
            undefined,
            { lat: nearestBin.latitude, lng: nearestBin.longitude }
          );
          setMessages((prev) => [...prev, resMsg]);
          setIsLoading(false);
          return;
        }
      } catch {
        console.log(
          "Response is not a JSON, continuing to make chat message..."
        );
      }

      // Create the bot response message
      let botResponse: ChatMessage = {
        type: "text" as const,
        role: "model" as const,
        content: botResponseText,
      };

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

  const handleQuickOptionsImageTap = () => {
    handleImageUpload();
    setShowQuickOptions(false);
  };

  const handleQuickOptionsLocationTap = async () => {
    setShowMenu(false);
    setShowQuickOptions(false);
    const location = await getCurrentLocation();
    if (location) {
      const userMessage: ChatMessage = {
        type: "text",
        role: "user",
        content: `I'm at these coordinates: latitude is ${location.lat}, longitude is ${location.lng}`,
      };
      setLocationInSessionStorage(
        SESSION_STORAGE_NAMES.CURRENT_LOCATION,
        location
      );

      sendMessage(userMessage);
    }
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
            <div
              key={index}
              style={{
                alignSelf: message.role === "user" ? "flex-start" : "flex-end",
                maxWidth: "80%",
              }}
            >
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
                {message.location && (
                  <LocationButton
                    onClick={() => handleDirectToLocation(message.location!)}
                  >
                    <FontAwesomeIcon icon={faDirections} />
                    Get Directions
                  </LocationButton>
                )}
              </MessageBubble>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>
      )}

      {showQuickOptions ? (
        <QuickOptionsMenu>
          <QuickOption onClick={handleQuickOptionsImageTap}>
            <FontAwesomeIcon icon={faImage} /> Upload an image
          </QuickOption>
          <QuickOption onClick={handleQuickOptionsLocationTap}>
            <FontAwesomeIcon icon={faLocationDot} /> Share location
          </QuickOption>
        </QuickOptionsMenu>
      ) : null}

      <InputContainer>
        <ImageButton onClick={() => setShowQuickOptions(!showQuickOptions)}>
          <FontAwesomeIcon icon={faCirclePlus} />
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
