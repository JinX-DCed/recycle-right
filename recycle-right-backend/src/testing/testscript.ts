import { readFileSync } from "node:fs";
import { callGemini, ChatMsg } from "../gemini";

/**
 * A script that I'm using to test the integration with Gemini.
 * Leaving it here in case you want to use it to test too.
 */

// EDIT THE IMG PATH FOR YOUR USE
const testImgPath = "src/test_img.jpeg";
const testPrompt =
  "There are a few items in this picture. Can you tell me which of these can be recycled, and how to recycle it? I am in Singapore.";

const imageToBase64 = (filePath: string) => {
  try {
    const file = readFileSync(filePath);
    const base64String = file.toString("base64");
    return base64String;
  } catch (error) {
    console.error(`Error reading or converting image: ${error}`);
    return undefined; // Or throw the error if you prefer
  }
};

const testImg: string = imageToBase64(testImgPath) || "";

const coords = [103.789605, 1.299327];
const bluebinPrompt = `Can you find the nearest recycling bin or station? My current coordinates are (${coords[0]}, ${coords[1]})`;

// const msgs: ChatMsg[] = [
//   {
//     role: "user",
//     type: "text",
//     content: testPrompt,
//   },
//   {
//     role: "user",
//     type: "image",
//     content: testImg,
//     mimeType: "image/jpeg",
//   },
// ];
const msgs: ChatMsg[] = [
  {
    role: "user",
    type: "text",
    content: bluebinPrompt,
  },
];

callGemini(msgs).then((res) => {
  console.log(res);
});
