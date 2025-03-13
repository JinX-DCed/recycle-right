// Load environment variables from .env file
import dotenv from 'dotenv';
// Configure dotenv to load environment variables
dotenv.config();

import express from "express";
import { callGemini, recognizeImage, ChatMsg } from "./gemini";
import { getNearestBinCoordinates } from "./findNearestBin";
// Add cors for cross-origin requests
import cors from "cors";

const app = express();
const port = process.env.PORT || 3001;

// Create an API router for better organization
const apiRouter = express.Router();

// Enable CORS for all routes - use a more permissive configuration for development
app.use(cors());

// Add preflight OPTIONS handling for all routes
app.options('*', cors());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// Configure middleware with appropriate limits
// For JSON payloads (limit only, no extended option for JSON)
app.use(express.json({ limit: "50mb" }));
// For URL-encoded form data (supports the extended option)
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/health", ((req, res) => {
  console.log("ALIVE");

  res.send("ALIVE");
}) as express.RequestHandler);

// Define API routes on the router
// Added endpoint to retrieve Mapbox token
apiRouter.get("/mapbox-token", ((req, res) => {
  // Get mapbox token from environment
  const mapboxToken = process.env.MAPBOX_TOKEN;
  
  if (!mapboxToken) {
    console.error("Mapbox token is not defined in environment variables");
    return res.status(404).json({
      error: "Mapbox token is not configured on the server"
    });
  }
  
  res.json({ token: mapboxToken });
}) as express.RequestHandler);

// Mount the API router at /api
app.use("/api", apiRouter);

app.post("/gemini", (async (req, res) => {
  try {
    // Log the entire request body for debugging
    console.log('Request body:', JSON.stringify(req.body));
    
    // Validate request
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('Invalid messages format:', req.body);
      res.status(400).json({
        error: "Invalid request: messages array is required"
      });
      return;
    }
    
    console.log(`Processing ${messages.length} chat messages`);
    
    // Process the messages
    const result = await callGemini(messages);
    console.log('Gemini API response received');
    
    // Send the response
    res.json({
      nextMsg: result,
    });
  } catch (error) {
    console.error("Error in /gemini endpoint:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}) as express.RequestHandler);

app.post("/image/recognise", (async (req, res) => {
  try {
    const { image } = req.body;
    
    // Validate the image input
    if (!image) {
      res.status(400).json({
        error: "No image provided"
      });
      return;
    }
    
    // Log that we received an image (don't log the actual content for privacy/security)
    console.log("Received image for recognition");
    
    // Optional: check if the image is a valid base64 string
    try {
      // Simple validation - real implementation would do more thorough checking
      if (typeof image !== 'string') {
        res.status(400).json({
          error: "Image must be a base64 encoded string"
        });
        return;
      }
      
      // Try to determine the image type from the base64 string
      let mimeType = "image/jpeg"; // Default
      if (image.includes('data:image/') && image.includes(';base64,')) {
        // The frontend didn't strip the prefix, extract mime type and handle it
        mimeType = image.split(';')[0].split(':')[1];
      }
      
      // Use the dedicated image recognition function
      const result = await recognizeImage(image, mimeType);
      console.log("Image recognition result received");
      
      res.json(result);
    } catch (validationError) {
      console.error('Error validating image:', validationError);
      res.status(400).json({
        error: 'Invalid image format',
        message: validationError instanceof Error ? validationError.message : String(validationError)
      });
    }
  } catch (error) {
    console.error('Error in image recognition endpoint:', error);
    res.status(500).json({
      error: 'Failed to process image recognition request',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}) as express.RequestHandler);

// app.post("/bin/nearest", (req, res) => {
//   const { latitude, longitude } = req.body;

//   const result = getNearestBinCoordinates(longitude, latitude);

//   res.send(result);
// });

app.use(((req, res) => {
  // Handle 404 - Route not found
  res.status(404).json({
    error: "Not Found",
    message: `The requested endpoint ${req.method} ${req.path} does not exist`
  });
}) as express.RequestHandler);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'production' ? 
      "An unexpected error occurred" : 
      (err.message || "Unknown error")
  });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
  console.log(`Gemini API Key ${process.env.GEMINI_API_KEY ? 'is configured' : 'is NOT configured - check your environment variables!'}`);
  console.log(`Mapbox Token ${process.env.MAPBOX_TOKEN ? 'is configured' : 'is NOT configured - check your environment variables!'}`);
});
