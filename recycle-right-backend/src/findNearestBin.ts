import { FunctionDeclaration, SchemaType } from "@google/generative-ai";
import binData from "./data/RecyclingBins.json";
import { getDistance } from "geolib";

/**
 * Functions for getting closest bin to a location.
 * Bin dataset is from https://data.gov.sg/datasets/d_4dde14826642f49eefff48b7832b90db/view
 */

type BinGeoJson = {
  features: {
    geometry: {
      coordinates: number[];
    };
  }[];
};
const binCoordinates = (binData as BinGeoJson).features.map(
  (location) => location.geometry.coordinates
);

type CoordDistance = {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number;
};

export const getNearestBinCoordinates = (
  currentLongitude: number,
  currentLatitude: number
) => {
  const currentCoordinates = {
    longitude: currentLongitude,
    latitude: currentLatitude,
  };

  let currentNearestCoordinates: CoordDistance[] = [
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
    const distance = getDistance(currentCoordinates, {
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

// For use with Gemini Function calling
// Refer here for more info: https://ai.google.dev/gemini-api/docs/function-calling/tutorial?lang=node
export const getNearestBinFunctionDeclaration: FunctionDeclaration = {
  name: "getNearestBin",
  parameters: {
    type: SchemaType.OBJECT,
    description:
      "Gets the coordinates and distances (in metres) of nearest few recycling bins (Also known as BlooBin or blue bin) to the current location. Also returns a Google Map links to each location",
    properties: {
      currentLongitude: {
        type: SchemaType.NUMBER,
        description: "The longitude of the current position",
      },
      currentLatitude: {
        type: SchemaType.NUMBER,
        description: "The latitude of the current position",
      },
    },
    required: ["currentLongitude", "currentLatitude"],
  },
};
