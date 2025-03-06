import express from "express";
import { callGemini, ChatMsg } from "./gemini";
import { getNearestBinCoordinates } from "./findNearestBin";

const app = express();
const port = 8080;

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
