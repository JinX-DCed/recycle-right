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
exports.callGemini = void 0;
const generative_ai_1 = require("@google/generative-ai");
const findNearestBin_1 = require("./findNearestBin");
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('GEMINI_API_KEY is not defined in the environment variables!');
    // Using a placeholder in development, but in production this should throw an error
    // throw new Error('GEMINI_API_KEY is required');
}
// For use in Function calling by Gemini
// Refer to here: https://ai.google.dev/gemini-api/docs/function-calling/tutorial?lang=node
const tools = {
    getNearestBin: ({ currentLongitude, currentLatitude, }) => {
        return (0, findNearestBin_1.getNearestBinCoordinates)(currentLongitude, currentLatitude);
    },
};
const genAI = new generative_ai_1.GoogleGenerativeAI(API_KEY || 'DUMMY_KEY_FOR_DEVELOPMENT');
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ functionDeclarations: [findNearestBin_1.getNearestBinFunctionDeclaration] }],
    // This is the instruction that can be used to constrain and give more context to the model
    systemInstruction: "You will be talking about recycling in Singapore." +
        " If you are asked to identify items, there might be multiple items in the image, try to identify them all." +
        " If there is a question asking for the nearest recycling bin, include HTML anchor tags that links to Google Maps that opens to the location of the nearest bin in the response, and the anchor text will be 'here.'" +
        " Besides the nearest bin, a few alternatives should also be included in the response." +
        " If formatting of the response is required, use HTML formatting instead of Markdown." +
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
const callGemini = (msges) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const latestMsg = msges.pop();
    if (!latestMsg)
        throw new Error("No chat message found!");
    let chat;
    if (msges.length > 0) {
        const chatHistory = msges.map((msg) => ({
            role: msg.role,
            parts: [makeChatPart(msg)],
        }));
        chat = model.startChat({
            history: chatHistory,
        });
    }
    else {
        chat = model.startChat();
    }
    const result = yield chat.sendMessage([makeChatPart(latestMsg)]);
    const response = result.response;
    // It's possible for Gemini to call functions defined in code, determined via the prompt contents
    // This feature is used here to get the nearest bin location based on current location
    const call = (_a = response.functionCalls()) === null || _a === void 0 ? void 0 : _a[0];
    // If there is a function call by Gemini
    if (call) {
        console.log("Function call: ", call.name, "with args:", call.args);
        const funcCallResult = tools[call.name](call.args);
        const result2 = yield chat.sendMessage([
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
});
exports.callGemini = callGemini;
