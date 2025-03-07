import express from "express";
import { callGemini, ChatMsg } from "./gemini";
import { getNearestBinCoordinates } from "./findNearestBin";

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON requests
app.use(express.json({ limit: '50mb' }));

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.post("/gemini", async (req, res) => {
  // messages is of type ChatMsgs
  const { messages } = req.body;

  const result = await callGemini(messages);

  res.send(result);
});

app.post("/image/recognize", async (req, res) => {
  const { image } = req.body;

  const example = {
    name: "Empty bottle",
    canBeRecycled: true,
  };

  const prompt: ChatMsg = {
    type: "text",
    role: "user",
    content:
      "The following is a base64 encoded image of one item. Return in JSON format two pieces of information. 1) The name of this item. 2) Whether this item can be recycled in Singapore, either true or false. The following is an example: " +
      JSON.stringify(example),
  };

  const messages: ChatMsg[] = [prompt];
  messages.push({
    type: "image",
    role: "user",
    content: image,
    mimeType: "image/jpeg",
  });

  const result = await callGemini(messages);

  res.send(result);
});

// app.post("/bin/nearest", (req, res) => {
//   const { latitude, longitude } = req.body;

//   const result = getNearestBinCoordinates(longitude, latitude);

//   res.send(result);
// });

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
