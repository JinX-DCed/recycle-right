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
const port = process.env.PORT || 3001;
// Enable CORS for all routes - use a more permissive configuration for development
app.use((0, cors_1.default)());
// Add preflight OPTIONS handling for all routes
app.options('*', (0, cors_1.default)());
// Log all incoming requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});
// Configure middleware with appropriate limits
// For JSON payloads (limit only, no extended option for JSON)
app.use(express_1.default.json({ limit: "50mb" }));
// For URL-encoded form data (supports the extended option)
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.get("/health", (req, res) => {
    console.log("ALIVE");
    res.send("ALIVE");
});
app.post("/gemini", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Log the entire request body for debugging
        console.log('Request body:', JSON.stringify(req.body));
        // Validate request
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.log('Invalid messages format:', req.body);
            res.status(400).json({
                error: "Invalid request: messages array is required"
            });
            return;
        }
        console.log(`Processing ${messages.length} chat messages`);
        // Process the messages
        const result = yield (0, gemini_1.callGemini)(messages);
        console.log('Gemini API response received');
        // Send the response
        res.json({
            nextMsg: result,
        });
    }
    catch (error) {
        console.error("Error in /gemini endpoint:", error);
        res.status(500).json({
            error: "Failed to process chat request",
            message: error instanceof Error ? error.message : String(error)
        });
    }
}));
app.post("/image/recognise", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { image } = req.body;
        // Validate the image input
        if (!image) {
            res.status(400).json({
                error: "No image provided"
            });
            return;
        }
        // Log that we received an image (don't log the actual content for privacy/security)
        console.log("Received image for recognition");
        // Optional: check if the image is a valid base64 string
        try {
            // Simple validation - real implementation would do more thorough checking
            if (typeof image !== 'string') {
                res.status(400).json({
                    error: "Image must be a base64 encoded string"
                });
                return;
            }
            // Try to determine the image type from the base64 string
            let mimeType = "image/jpeg"; // Default
            if (image.includes('data:image/') && image.includes(';base64,')) {
                // The frontend didn't strip the prefix, extract mime type and handle it
                mimeType = image.split(';')[0].split(':')[1];
            }
            // Use the dedicated image recognition function
            const result = yield (0, gemini_1.recognizeImage)(image, mimeType);
            console.log("Image recognition result received");
            res.json(result);
        }
        catch (validationError) {
            console.error('Error validating image:', validationError);
            res.status(400).json({
                error: 'Invalid image format',
                message: validationError instanceof Error ? validationError.message : String(validationError)
            });
        }
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
app.use((req, res) => {
    // Handle 404 - Route not found
    res.status(404).json({
        error: "Not Found",
        message: `The requested endpoint ${req.method} ${req.path} does not exist`
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: "Internal Server Error",
        message: process.env.NODE_ENV === 'production' ?
            "An unexpected error occurred" :
            (err.message || "Unknown error")
    });
});
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
    console.log(`Gemini API Key ${process.env.GEMINI_API_KEY ? 'is configured' : 'is NOT configured - check your environment variables!'}`);
});
