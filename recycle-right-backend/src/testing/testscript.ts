import { readFileSync } from "node:fs";
import { callGemini, ChatMsg } from "../gemini";

/**
 * A script that I'm using to test the integration with Gemini.
 * Leaving it here in case you want to use it to test too.
 */

// EDIT THE IMG PATH FOR YOUR USE
const testImgPath = "src/test_img_2.jpeg";
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
// const msgs: ChatMsg[] = [
//   {
//     role: "user",
//     type: "text",
//     content: bluebinPrompt,
//   },
// ];

const example = {
  name: "Empty bottle",
  canBeRecycled: true,
};

const prompt: ChatMsg = {
  type: "text",
  role: "user",
  content:
    "The following is a base64 encoded image of one item. Return in JSON format two pieces of information. 1) The name of this item. 2) Whether this item can be recycled in Singapore, either true or false. The following is an example: " +
    JSON.stringify(example),
};

const msgs: ChatMsg[] = [prompt];
msgs.push({
  type: "image",
  role: "user",
  content: testImg,
  mimeType: "image/jpeg",
});

callGemini(msgs).then((res) => {
  console.log(res);
});
