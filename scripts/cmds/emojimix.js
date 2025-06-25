const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
 config: {
 name: "emojimix",
 version: "1.0",
 author: "Your Name",
 countDown: 10,
 role: 0,
 shortDescription: {
 en: "Mix two emojis together"
 },
 longDescription: {
 en: "Create a mashup of two emojis using Google's Emoji Kitchen"
 },
 category: "fun",
 guide: {
 en: "{pn} <emoji1> <emoji2>"
 }
 },

 langs: {
 en: {
 missingEmojis: "Please provide two emojis to mix",
 invalidEmojis: "Please provide valid emoji combinations",
 tooManyRequests: "Too many requests, please try again later",
 error: "Failed to create emoji mix"
 }
 },

 onStart: async function ({ message, args, getLang }) {
 try {
 // Check if two emojis are provided
 if (args.length < 2) {
 return message.reply(getLang("missingEmojis"));
 }

 const emoji1 = args[0];
 const emoji2 = args[1];

 // Get emoji codes
 const code1 = [...emoji1][0].codePointAt(0).toString(16);
 const code2 = [...emoji2][0].codePointAt(0).toString(16);

 // Google's Emoji Kitchen URL pattern
 const url = `https://www.gstatic.com/android/keyboard/emojikitchen/${getDateString()}/u${code1}/u${code1}_u${code2}.png`;

 // Temporary file path
 const tempFilePath = path.join(__dirname, "temp", `emojimix_${Date.now()}.png`);

 // Download the image
 const response = await axios({
 method: "GET",
 url: url,
 responseType: "stream",
 headers: {
 "User-Agent": "Mozilla/5.0"
 }
 });

 // Save the image
 const writer = fs.createWriteStream(tempFilePath);
 response.data.pipe(writer);

 await new Promise((resolve, reject) => {
 writer.on("finish", resolve);
 writer.on("error", reject);
 });

 // Send the image
 await message.reply({
 attachment: fs.createReadStream(tempFilePath)
 });

 // Clean up
 fs.unlinkSync(tempFilePath);

 } catch (error) {
 console.error(error);
 if (error.response && error.response.status === 429) {
 return message.reply(getLang("tooManyRequests"));
 }
 return message.reply(getLang("error"));
 }
 }
};

// Helper function to get current date string for Google's URL
function getDateString() {
 const now = new Date();
 const year = now.getFullYear();
 const month = String(now.getMonth() + 1).padStart(2, '0');
 const day = String(now.getDate()).padStart(2, '0');
 return `${year}${month}${day}`;
}