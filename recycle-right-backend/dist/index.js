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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file
const dotenv_1 = __importDefault(require("dotenv"));
// Configure dotenv to load environment variables
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const gemini_1 = require("./gemini");
// Add cors for cross-origin requests
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3001;
// Enable CORS for all routes
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "50mb" }));
app.get("/health", (req, res) => {
    console.log("ALIVE");
    res.send("ALIVE");
});
app.post("/gemini", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // messages is of type ChatMsgs
    const { messages } = req.body;
    console.log("Received chat messages");
    const result = yield (0, gemini_1.callGemini)(messages);
    console.log(result);
    res.send({
        nextMsg: result,
    });
}));
app.post("/image/recognise", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { image } = req.body;
    if (!image) {
        res.status(400).json({
            error: "No image provided"
        });
        return;
    }
    console.log("Received image for recognition: ", image.slice(0, 10));
    try {
        // Use the dedicated image recognition function
        const result = yield (0, gemini_1.recognizeImage)(image);
        console.log("Image recognition result received");
        res.json(result);
    }
    catch (error) {
        console.error('Error in image recognition endpoint:', error);
        res.status(500).json({
            error: 'Failed to process image recognition request',
            message: error instanceof Error ? error.message : String(error)
        });
    }
}));
// app.post("/bin/nearest", (req, res) => {
//   const { latitude, longitude } = req.body;
//   const result = getNearestBinCoordinates(longitude, latitude);
//   res.send(result);
// });
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
