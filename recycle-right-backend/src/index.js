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
const express_1 = __importDefault(require("express"));
const gemini_1 = require("./gemini");
// Add cors for cross-origin requests
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 8080;
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
    console.log("received image: ", image.slice(0, 10));
    const example = {
        name: "Empty bottle",
        canBeRecycled: true,
    };
    const prompt = {
        type: "text",
        role: "user",
        content: "The following is a base64 encoded image of one item. Return in JSON format two pieces of information. 1) The generic name of this item. 2) Whether this item can be recycled in Singapore, either true or false. The following is an example: " +
            JSON.stringify(example),
    };
    const messages = [prompt];
    messages.push({
        type: "image",
        role: "user",
        content: image,
        mimeType: "image/jpeg",
    });
    console.log("Sending to gemini");
    const result = yield (0, gemini_1.callGemini)(messages);
    console.log("Result is ", result);
    res.send(result);
}));
// app.post("/bin/nearest", (req, res) => {
//   const { latitude, longitude } = req.body;
//   const result = getNearestBinCoordinates(longitude, latitude);
//   res.send(result);
// });
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
