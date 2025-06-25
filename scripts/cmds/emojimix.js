const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
 config: {
 name: "emojimix",
 version: "1.0",
 author: "Chitron Bhattacharjee",
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
 missingEmojis: "⚠️ Please provide two emojis to mix",
 invalidEmojis: "❌ Couldn't find a mashup for these emojis",
 tooManyRequests: "⏳ Too many requests, please try again later",
 error: "⚠️ Failed to create emoji mix"
 }
 },

 onStart: async function ({ message, args, getLang }) {
 try {
 if (args.length < 2) {
 return message.reply(getLang("missingEmojis"));
 }

 const emoji1 = args[0];
 const emoji2 = args[1];

 const code1 = Array.from(emoji1).map(c => c.codePointAt(0).toString(16)).join("-");
 const code2 = Array.from(emoji2).map(c => c.codePointAt(0).toString(16)).join("-");

 const dateStr = getDateString();
 const url = `https://www.gstatic.com/android/keyboard/emojikitchen/${dateStr}/u${code1}/u${code1}_u${code2}.png`;

 const tempDir = path.join(__dirname, "temp");
 if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
 const tempFilePath = path.join(tempDir, `emojimix_${Date.now()}.png`);

 const response = await axios({
 method: "GET",
 url,
 responseType: "stream",
 headers: {
 "User-Agent": "Mozilla/5.0"
 }
 }).catch(err => {
 if (err.response?.status === 404) return null;
 throw err;
 });

 if (!response) {
 return message.reply(getLang("invalidEmojis"));
 }

 const writer = fs.createWriteStream(tempFilePath);
 response.data.pipe(writer);

 await new Promise((resolve, reject) => {
 writer.on("finish", resolve);
 writer.on("error", reject);
 });

 await message.reply({
 attachment: fs.createReadStream(tempFilePath)
 });

 fs.unlinkSync(tempFilePath);

 } catch (error) {
 console.error("EmojiMix Error:", error);
 if (error.response?.status === 429) {
 return message.reply(getLang("tooManyRequests"));
 }
 return message.reply(getLang("error"));
 }
 }
};

// Helper function to get current date string for Google's Emoji Kitchen
function getDateString() {
 const now = new Date();
 const year = now.getFullYear();
 const month = String(now.getMonth() + 1).padStart(2, '0');
 const day = String(now.getDate()).padStart(2, '0');
 return `${year}${month}${day}`;
}