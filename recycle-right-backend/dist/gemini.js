"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGemini = exports.recognizeImage = void 0;
const generative_ai_1 = require("@google/generative-ai");
const findNearestBin_1 = require("./findNearestBin");
// Get API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
// Set a flag to track if we're using a real API key or a dummy one
const isDummyKey = !API_KEY;
// Demo responses for when no API key is available
const DEMO_RESPONSES = [
    "This is a demo response because no Gemini API key is configured. Please add a valid API key to enable real AI responses.",
    "I'm unable to provide a real response without a Gemini API key. You can get a key from Google AI Studio.",
    "To use the real AI capabilities, please configure a GEMINI_API_KEY in your backend environment variables.",
    "This is a simulated response. For production use, please add your Gemini API key to the backend.",
    "For testing purposes only: This would normally be answered by Google's Gemini AI if an API key was configured.",
];
// Get a random demo response
const getRandomDemoResponse = () => {
    return DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
};
if (isDummyKey) {
    console.warn("⚠️ WARNING: GEMINI_API_KEY is not defined in the environment variables!");
    console.warn("⚠️ Using DEMO MODE which will return mock responses.");
    console.warn("⚠️ Please set the GEMINI_API_KEY environment variable to use the real API.");
    console.warn("⚠️ In development, you can create a .env file in the backend directory with:");
    console.warn("⚠️ GEMINI_API_KEY=your_actual_api_key");
}
// For use in Function calling by Gemini
// Refer to here: https://ai.google.dev/gemini-api/docs/function-calling/tutorial?lang=node
const tools = {
    getNearestBin: ({ currentLongitude, currentLatitude, }) => {
        return (0, findNearestBin_1.getNearestBinCoordinates)(currentLongitude, currentLatitude);
    },
};
// Create the Google AI client with appropriate key and detailed logging
const apiKeyToUse = API_KEY || "DUMMY_KEY_FOR_DEVELOPMENT";
console.log(`Using API key: ${isDummyKey ? "DUMMY (WILL FAIL)" : "VALID KEY PROVIDED"}`);
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKeyToUse);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ functionDeclarations: [findNearestBin_1.getNearestBinFunctionDeclaration] }],
    // This is the instruction that can be used to constrain and give more context to the model
    systemInstruction: "You will be talking about recycling in Singapore." +
        " If you are asked to identify items, there might be multiple items in the image, try to identify them all." +
        " If it looks like the item is made of different materials and those materials should be separated for recycling, give suggestions for those as well." +
        // " If there is a question asking for the nearest recycling bin, include HTML anchor tags that links to Google Maps that opens to the location of the nearest bin in the response, and the anchor text will be 'here.'" +
        // " Besides the nearest bin, a few alternatives should also be included in the response." +
        "If a location is shared without context, assume that it is asking for the nearest recycling bins." +
        " If there is a question asking for the nearest recycling bin, call the getNearestBin function." +
        " Make the responses easy to read, with short sentences and paragraphs, and listing in points if possible.",
});
const makeChatPart = (msg) => {
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
const recognizeImage = (imageBase64_1, ...args_1) => __awaiter(void 0, [imageBase64_1, ...args_1], void 0, function* (imageBase64, mimeType = "image/jpeg") {
    try {
        // Early check if we're using a dummy key - provide demo response
        if (isDummyKey) {
            console.log("Using demo mode for image recognition");
            // Return a simulated image recognition result
            return {
                name: "Demo Item",
                canBeRecycled: true,
                note: "This is a demo response because no Gemini API key is configured. Please add a valid API key.",
            };
        }
        console.log("Recognizing image with Gemini Vision - image length:", imageBase64.length);
        // Create a specialized prompt for image recognition
        const example = {
            name: "Empty bottle",
            canBeRecycled: true,
        };
        const textPrompt = {
            type: "text",
            role: "user",
            content: "The following is a base64 encoded image of one or more items. Return in JSON format two pieces of information. 1) The generic name(s) of the item(s). 2) Whether this item can be recycled in Singapore, either true or false. The following is an example: " +
                JSON.stringify(example) +
                ". IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or backticks.",
        };
        const imagePrompt = {
            type: "image",
            role: "user",
            content: imageBase64,
            mimeType: mimeType,
        };
        const messages = [textPrompt, imagePrompt];
        // Use the general callGemini function to process the request
        const result = yield (0, exports.callGemini)(messages);
        // Process the result to ensure it's valid JSON
        try {
            // Check if the response is wrapped in markdown code block
            let jsonData;
            if (typeof result === "string" && result.includes("```")) {
                // Extract content between code blocks
                const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (jsonMatch && jsonMatch[1]) {
                    // Parse the extracted JSON
                    jsonData = JSON.parse(jsonMatch[1].trim());
                }
                else {
                    // If no code block match, try direct parsing
                    jsonData = JSON.parse(result);
                }
            }
            else {
                // If not wrapped in code block, try direct parsing
                jsonData = typeof result === "string" ? JSON.parse(result) : result;
            }
            return jsonData;
        }
        catch (error) {
            console.error("Error parsing Gemini response:", error);
            return {
                error: "Failed to parse response from image recognition",
                rawResponse: result,
            };
        }
    }
    catch (error) {
        console.error("Error in recognizeImage:", error);
        return {
            error: "An unexpected error occurred during image recognition",
            message: error instanceof Error ? error.message : String(error),
        };
    }
});
exports.recognizeImage = recognizeImage;
const callGemini = (msges) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Early check if we're using a dummy key - provide demo response instead of error
        if (isDummyKey) {
            console.log("Using demo mode - returning simulated response");
            // Extract user's message to personalize the demo response
            let userMessage = "";
            if (msges.length > 0) {
                const lastMsg = msges[msges.length - 1];
                if (lastMsg.type === "text" && lastMsg.role === "user") {
                    userMessage = lastMsg.content;
                }
            }
            // Return a demo response that acknowledges the user's message
            return `[DEMO MODE] I received your message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? "..." : ""}". ${getRandomDemoResponse()}`;
        }
        // Log the incoming messages
        console.log(`Calling Gemini with ${msges.length} messages`);
        // Since the frontend is now only sending the latest message(s),
        // we don't need to pop the last message anymore. Instead, we directly
        // use what's provided in the array.
        if (msges.length === 0) {
            console.error("No messages found!");
            return "Error: No messages provided. Please try again.";
        }
        // Get the latest message - for image + text requests, text will be last
        const latestMsg = msges[msges.length - 1];
        // Previous messages could include an image in the case of image recognition
        const previousMessages = msges.length > 1 ? msges.slice(0, -1) : [];
        let chat;
        try {
            if (previousMessages.length > 0) {
                // If we have previous messages (like an image before a text question)
                // use them as chat history
                const chatHistory = previousMessages.map((msg) => ({
                    role: msg.role,
                    parts: [makeChatPart(msg)],
                }));
                chat = model.startChat({
                    history: chatHistory,
                });
            }
            else {
                // Otherwise just start a fresh chat
                chat = model.startChat();
            }
            console.log("Sending message to Gemini API...");
            const result = yield chat.sendMessage([makeChatPart(latestMsg)]);
            const response = result.response;
            console.log("Received response from Gemini API");
            // It's possible for Gemini to call functions defined in code, determined via the prompt contents
            // This feature is used here to get the nearest bin location based on current location
            try {
                const call = (_a = response.functionCalls()) === null || _a === void 0 ? void 0 : _a[0];
                // If there is a function call by Gemini
                if (call) {
                    console.log("Function call: ", call.name, "with args:", call.args);
                    if (!tools[call.name]) {
                        console.error(`Function ${call.name} was called but is not defined in tools.`);
                        return `The AI attempted to use a function that isn't available. Please try a different question.`;
                    }
                    const funcCallResult = tools[call.name](call.args);
                    if (call.name === "getNearestBin") {
                        return JSON.stringify({
                            locations: funcCallResult,
                        });
                    }
                    else {
                        const result2 = yield chat.sendMessage([
                            {
                                functionResponse: {
                                    name: call.name,
                                    response: {
                                        content: JSON.stringify(funcCallResult),
                                    },
                                },
                            },
                        ]);
                        return result2.response.text();
                    }
                }
            }
            catch (functionError) {
                console.error("Error during function calling:", functionError);
                // Continue with normal response if function calling fails
            }
            return response.text();
        }
        catch (apiError) {
            console.error("Error communicating with Gemini API:", apiError);
            return "Sorry, I'm having trouble connecting to my AI services. Please try again later.";
        }
    }
    catch (error) {
        console.error("Unexpected error in callGemini:", error);
        return "An unexpected error occurred. Please try again later.";
    }
});
exports.callGemini = callGemini;
