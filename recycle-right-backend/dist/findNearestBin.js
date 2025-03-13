"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearestBinFunctionDeclaration = exports.getNearestBinCoordinates = void 0;
const generative_ai_1 = require("@google/generative-ai");
const RecyclingBins_json_1 = __importDefault(require("./data/RecyclingBins.json"));
const geolib_1 = require("geolib");
const binCoordinates = RecyclingBins_json_1.default.features.map((location) => location.geometry.coordinates);
const getNearestBinCoordinates = (currentLongitude, currentLatitude) => {
    const currentCoordinates = {
        longitude: currentLongitude,
        latitude: currentLatitude,
    };
    let currentNearestCoordinates = [
        {
            coordinates: { longitude: 0, latitude: 0 },
            distance: Number.POSITIVE_INFINITY,
        },
        {
            coordinates: { longitude: 0, latitude: 0 },
            distance: Number.POSITIVE_INFINITY,
        },
        {
            coordinates: { longitude: 0, latitude: 0 },
            distance: Number.POSITIVE_INFINITY,
        },
    ];
    for (const coord of binCoordinates) {
        const distance = (0, geolib_1.getDistance)(currentCoordinates, {
            longitude: coord[0],
            latitude: coord[1],
        });
        currentNearestCoordinates.push({
            coordinates: { longitude: coord[0], latitude: coord[1] },
            distance: distance,
        });
        currentNearestCoordinates.sort((a, b) => a.distance - b.distance);
        currentNearestCoordinates.pop();
    }
    const result = currentNearestCoordinates.map((coord) => ({
        longitude: coord.coordinates.longitude,
        latitude: coord.coordinates.latitude,
        distance: coord.distance,
        // googleMapLink: `https://www.google.com/maps/search/?api=1&query=${coord.coordinates.latitude},${coord.coordinates.longitude}`,
    }));
    return result;
};
exports.getNearestBinCoordinates = getNearestBinCoordinates;
// For use with Gemini Function calling
// Refer here for more info: https://ai.google.dev/gemini-api/docs/function-calling/tutorial?lang=node
exports.getNearestBinFunctionDeclaration = {
    name: "getNearestBin",
    parameters: {
        type: generative_ai_1.SchemaType.OBJECT,
        description: "Gets the coordinates and distances (in metres) of nearest few recycling bins (Also known as BlooBin or blue bin) to the current location. Also returns a Google Map links to each location",
        properties: {
            currentLongitude: {
                type: generative_ai_1.SchemaType.NUMBER,
                description: "The longitude of the current position",
            },
            currentLatitude: {
                type: generative_ai_1.SchemaType.NUMBER,
                description: "The latitude of the current position",
            },
        },
        required: ["currentLongitude", "currentLatitude"],
    },
};
