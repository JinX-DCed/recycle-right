import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import Activity from "./components/Activity";
import Navigation from "./components/Navigation";
import styled from "styled-components";
import { useState, createContext } from "react";
import LogRecycling from "./pages/logRecycling";
import Modal from "./components/Modal";
import BinMapPage from "./pages/BinMapPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faPlus } from "@fortawesome/free-solid-svg-icons"; // Chat bubble icon
import ChatModal from "./components/ChatModal";
import axios from "axios";

const Container = styled.div`
  max-width: 28rem;
  margin: 0 auto;
  padding: 1rem;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const LRButton = styled.button`
  background-color: #006647;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #25eb92;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TTButton = styled.button`
  background-color: #006647;
  color: white;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #25eb92;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Create a custom axios instance with proper configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
console.log("Base URL:", API_BASE_URL);
// Create an axios instance with base URL and timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Define the interface for the recognized item data
interface RecognizedItemData {
  name: string;
  canBeRecycled: boolean;
  description: string;
  imageUrl: string | null;
}

// Define interface for the context
interface RecycleRightContextType {
  recognizedItem: RecognizedItemData | null;
  updateTotalPoints: (points: number) => void;
}

// Create a context for sharing recognized item data and functions across components
export const RecycleRightContext = createContext<RecycleRightContextType>({
  recognizedItem: null,
  updateTotalPoints: () => {}
});

const App = () => {
  const [totalPoints, setTotalPoints] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [recyclableDescription, setRecyclableDescription] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognizedItem, setRecognizedItem] = useState<RecognizedItemData | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Create object URL for immediate display
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsLoading(true);
    setIsModalOpen(true);
    setRecyclableDescription("Analyzing your image...");
    
    // Return a promise that resolves when the image processing is complete
    return new Promise<boolean>((resolve) => {
      // Read file as base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        let base64String = reader.result as string;
        
        // Extract the base64 part (remove data:image/jpeg;base64, prefix)
        if (base64String.includes(',')) {
          base64String = base64String.split(',')[1];
        }
        
        try {
          // Call the image recognition API
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
          console.log("Recognition response:", recognitionResponse);
          console.log("Recognition result:", recognitionResult);
          
          // Process the response
          let canRecycle = false;
          let itemName = "";
          let description = "";
          
          if (recognitionResult && !recognitionResult.error) {
            // Check if we have name and recyclability info
            if (recognitionResult.name) {
              itemName = recognitionResult.name;
              canRecycle = recognitionResult.canBeRecycled === true;
              
              description = `Identified as: ${itemName}. `;
              description += canRecycle ? 
                "This item can be recycled in Singapore." : 
                "This item cannot be recycled in Singapore.";
            } else {
              // Use raw response if we couldn't parse it properly
              description = `Image analysis completed, but couldn't determine recyclability.`;
            }
          } else {
            // Handle error case
            description = recognitionResult?.error || "Sorry, I couldn't analyze this image properly.";
          }
          console.log("Description", description);
          setRecyclableDescription(description);
          
          // Store the recognized item data for passing to LogRecycling
          setRecognizedItem({
            name: itemName,
            canBeRecycled: canRecycle,
            description: description,
            imageUrl: imageUrl
          });
          
          // Award points if the item is recyclable
          if (canRecycle) {
            setTotalPoints((prevPoints) => prevPoints + 10);
          }
          resolve(true);
          
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
          
          setRecyclableDescription("Sorry, I had trouble processing your image. Please try again later.");
          resolve(false);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const HomePage = () => {
    const navigate = useNavigate();

    const handleImageUploadWithNavigation = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      // Wait for image processing to complete before navigating
      const result = await handleImageUpload(e);
      
      // Display the modal with results for 2 seconds before navigating
      setTimeout(() => {
        navigate("/logRecycling");
        setIsModalOpen(false);
      }, 2000);
    };
    return (
      <Container>
        <Header />
        <div
          style={{
            textAlign: "center",
            margin: "20px 0",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Total Points: <span style={{ color: "#006647" }}>{totalPoints}</span>{" "}
          | Donovan
        </div>
        <div className="p-4">
          <TTButton onClick={() => setIsChatOpen(true)}>
            <FontAwesomeIcon icon={faComment} className="text-gray-700" />{" "}
            Trashtalker
          </TTButton>
          {/* <Link to="/logRecycling"> */}
          <LRButton>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUploadWithNavigation}
              style={{ display: "none" }}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              style={{
                color: "white",
                textDecoration: "none",
                width: "100%",
                display: "block",
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="text-gray-700" /> Log
              Recycling
            </label>
          </LRButton>
          {/* </Link> */}
          <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

          <Activity />
          <Navigation />
        </div>
      </Container>
    );
  };

  // Function to update the total points
  const updateTotalPoints = (points: number) => {
    setTotalPoints(prevPoints => prevPoints + points);
  };

  // Context value
  const contextValue = {
    recognizedItem,
    updateTotalPoints
  };

  return (
    <RecycleRightContext.Provider value={contextValue}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/binmap" element={<BinMapPage />} />
          <Route path="/logRecycling" element={<LogRecycling />} />
        </Routes>

      {/* Modal for displaying uploaded image and information */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2>Uploaded Image</h2>
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Uploaded"
              style={{ maxWidth: "100%" }}
            />
          )}
          <p>{recyclableDescription}</p>
          {isLoading ? (
            <p>Analyzing image...</p>
          ) : (
            <p>Total Points: {totalPoints}</p>
          )}
        </Modal>
      )}
    </Router>
    </RecycleRightContext.Provider>
  );
};

export default App;
