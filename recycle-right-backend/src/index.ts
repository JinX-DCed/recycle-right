import express from "express";
import { callGemini, ChatMsg } from "./gemini";
import { getNearestBinCoordinates } from "./findNearestBin";

const app = express();
const port = 8080;

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
  console.log("received image: ", (image as string).slice(0, 10));

  const example = {
    name: "Empty bottle",
    canBeRecycled: true,
  };

  const prompt: ChatMsg = {
    type: "text",
    role: "user",
    content:
      "The following is a base64 encoded image of one item. Return in JSON format two pieces of information. 1) The generic name of this item. 2) Whether this item can be recycled in Singapore, either true or false. The following is an example: " +
      JSON.stringify(example),
  };

  const messages: ChatMsg[] = [prompt];
  messages.push({
    type: "image",
    role: "user",
    content: image,
    mimeType: "image/jpeg",
  });

  console.log("Sending to gemini");
  const result = await callGemini(messages);

  console.log("Result is ", result);
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
