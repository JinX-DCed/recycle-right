import express from "express";
import { callGemini } from "./gemini";

const app = express();
const port = 8080;

app.post("/gemini", async (req, res) => {
  // messages is of type ChatMsgs
  const { messages } = req.body;

  const result = await callGemini(messages);

  res.send(result);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
