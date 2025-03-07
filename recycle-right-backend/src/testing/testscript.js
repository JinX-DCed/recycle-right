"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const gemini_1 = require("../gemini");
/**
 * A script that I'm using to test the integration with Gemini.
 * Leaving it here in case you want to use it to test too.
 */
// EDIT THE IMG PATH FOR YOUR USE
const testImgPath = "src/test_img_2.jpeg";
const testPrompt = "There are a few items in this picture. Can you tell me which of these can be recycled, and how to recycle it? I am in Singapore.";
const imageToBase64 = (filePath) => {
    try {
        const file = (0, node_fs_1.readFileSync)(filePath);
        const base64String = file.toString("base64");
        return base64String;
    }
    catch (error) {
        console.error(`Error reading or converting image: ${error}`);
        return undefined; // Or throw the error if you prefer
    }
};
const testImg = imageToBase64(testImgPath) || "";
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
const prompt = {
    type: "text",
    role: "user",
    content: "The following is a base64 encoded image of one item. Return in JSON format two pieces of information. 1) The name of this item. 2) Whether this item can be recycled in Singapore, either true or false. The following is an example: " +
        JSON.stringify(example),
};
const msgs = [prompt];
msgs.push({
    type: "image",
    role: "user",
    content: testImg,
    mimeType: "image/jpeg",
});
(0, gemini_1.callGemini)(msgs).then((res) => {
    console.log(res);
});
