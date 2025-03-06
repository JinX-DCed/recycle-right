import {
  ChatSession,
  Content,
  GoogleGenerativeAI,
  Part,
} from "@google/generative-ai";
import {
  getNearestBinCoordinates,
  getNearestBinFunctionDeclaration,
} from "./findNearestBin";

const API_KEY = process.env.GEMINI_API_KEY;

// For use in Function calling by Gemini
// Refer to here: https://ai.google.dev/gemini-api/docs/function-calling/tutorial?lang=node
const tools: { [key: string]: any } = {
  getNearestBin: ({
    currentLongitude,
    currentLatitude,
  }: {
    currentLongitude: number;
    currentLatitude: number;
  }) => {
    return getNearestBinCoordinates(currentLongitude, currentLatitude);
  },
};

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  tools: [{ functionDeclarations: [getNearestBinFunctionDeclaration] }],
  // This is the instruction that can be used to constrain and give more context to the model
  systemInstruction:
    "You will be talking about recycling in Singapore." +
    " If there is a question asking for the nearest recycling bin, include HTML anchor tags that links to Google Maps that opens to the location of the nearest bin in the response, and the anchor text will be 'here.'" +
    " Besides the nearest bin, a few alternatives should also be included in the response",
});

export type ChatMsg = {
  type: "text" | "image"; // Whether this message is text or an image
  role: "model" | "user"; // Whether this message is sent by the user or the AI model
  mimeType?: string; // Required if type is "image"
  content: string; // If text, the text message, If image, then the base64 encoded image
};

const makeChatPart = (msg: ChatMsg): Part => {
  switch (msg.type) {
    case "text":
      return { text: msg.content };
    case "image":
      if (!msg.mimeType) {
        throw new Error("No mime type found for image!");
      }

      return {
        inlineData: {
          mimeType: msg.mimeType,
          data: msg.content,
        },
      };
    default:
      throw new Error("No type found in message!");
  }
};

export const callGemini = async (msges: ChatMsg[]) => {
  const latestMsg = msges.pop();
  if (!latestMsg) throw new Error("No chat message found!");

  let chat: ChatSession;

  if (msges.length > 0) {
    const chatHistory: Content[] = msges.map(
      (msg): Content => ({
        role: msg.role,
        parts: [makeChatPart(msg)],
      })
    );

    chat = model.startChat({
      history: chatHistory,
    });
  } else {
    chat = model.startChat();
  }

  const result = await chat.sendMessage([makeChatPart(latestMsg)]);
  const response = result.response;

  // It's possible for Gemini to call functions defined in code, determined via the prompt contents
  // This feature is used here to get the nearest bin location based on current location
  const call = response.functionCalls()?.[0];

  // If there is a function call by Gemini
  if (call) {
    console.log("Function call: ", call.name, "with args:", call.args);
    const funcCallResult = tools[call.name](call.args);

    const result2 = await chat.sendMessage([
      {
        functionResponse: {
          name: "getNearestBin",
          response: {
            content: JSON.stringify(funcCallResult),
          },
        },
      },
    ]);

    return result2.response.text();
  }

  return result.response.text();
};
