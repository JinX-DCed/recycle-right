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
const port = 3001;

// Enable CORS for all routes
app.use(cors());

app.use(express.json({ limit: "50mb" }));

app.get("/health", (req, res) => {
  console.log("ALIVE");

  res.send("ALIVE");
});

app.post("/gemini", async (req, res) => {
  // messages is of type ChatMsgs
  const { messages } = req.body;
  console.log("Received chat messages");

  const result = await callGemini(messages);
  console.log(result);

  res.send({
    nextMsg: result,
  });
});

app.post("/image/recognise", async (req, res) => {
  const { image } = req.body;
  
  if (!image) {
    res.status(400).json({
      error: "No image provided"
    });
    return;
  }
  
  console.log("Received image for recognition: ", (image as string).slice(0, 10));
  
  try {
    // Use the dedicated image recognition function
    const result = await recognizeImage(image);
    console.log("Image recognition result received");
    
    res.json(result);
  } catch (error) {
    console.error('Error in image recognition endpoint:', error);
    res.status(500).json({
      error: 'Failed to process image recognition request',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// app.post("/bin/nearest", (req, res) => {
//   const { latitude, longitude } = req.body;

//   const result = getNearestBinCoordinates(longitude, latitude);

//   res.send(result);
// });

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
