const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
 config: {
 name: "emojimean",
 alias: ["em", "emoji"],
 version: "2.0",
 author: "NTKhang",
 countDown: 5,
 role: 0,
 description: {
 en: "Find emoji meaning with direct emoji matching"
 },
 category: "wiki",
 guide: {
 en: "{pn} <emoji>"
 }
 },

 langs: {
 en: {
 missingEmoji: "⚠️ Please enter an emoji",
 meaningOfEmoji: "✨ Emoji: %1\n\n📝 Meaning: %2\n\n🔍 Details: %3\n\n⚡ Shortcode: %4\n\n🌐 Source: %5",
 notFound: "❌ Couldn't find meaning for this emoji",
 manyRequest: "⚠️ Too many requests, please try again later",
 error: "⚠️ Error processing emoji",
 tryingAlternative: "🔍 Searching alternative sources..."
 }
 },

 onStart: async function ({ args, message, getLang }) {
 try {
 const emoji = args[0];
 if (!emoji) {
 return message.reply(getLang("missingEmoji"));
 }

 // Try direct emoji search first
 let result = await this.getDirectEmojiMeaning(emoji);
 
 // If not found, try alternative methods
 if (!result) {
 await message.reply(getLang("tryingAlternative"));
 result = await this.getUnicodeFallback(emoji);
 }

 if (!result) {
 return message.reply(getLang("notFound"));
 }

 return message.reply(getLang(
 "meaningOfEmoji",
 emoji, // Actual emoji shown
 result.meaning || "No description",
 result.moreMeaning || "No details",
 result.shortcode || "No shortcode",
 result.source || "Unknown source"
 ));

 } catch (error) {
 console.error("Error:", error);
 if (error.response?.status === 429) {
 return message.reply(getLang("manyRequest"));
 }
 return message.reply(getLang("error"));
 }
 },

 getDirectEmojiMeaning: async function(emoji) {
 try {
 // First try emojipedia direct emoji search
 const url = `https://emojipedia.org/search/?q=${encodeURIComponent(emoji)}`;
 const { data } = await axios.get(url, {
 timeout: 8000,
 headers: {
 'User-Agent': 'Mozilla/5.0'
 }
 });

 const $ = cheerio.load(data);
 const firstResult = $('.emoji-list a').first();
 if (!firstResult.length) return null;

 const emojiPage = await axios.get(`https://emojipedia.org${firstResult.attr('href')}`);
 const $$ = cheerio.load(emojiPage.data);

 return {
 meaning: $$('section.about p').first().text().trim(),
 moreMeaning: $$('section.about p').eq(1).text().trim(),
 shortcode: $$('input[name="emoji"]').val()?.trim(),
 source: "emojipedia.org"
 };
 } catch {
 return null;
 }
 },

 getUnicodeFallback: async function(emoji) {
 try {
 // Convert emoji to Unicode points
 const codePoints = [...emoji].map(c => 
 c.codePointAt(0).toString(16).toUpperCase()
 ).join('-');

 // Try emojipedia Unicode search
 const { data } = await axios.get(
 `https://emojipedia.org/emoji/${codePoints}/`,
 { timeout: 8000 }
 );

 const $ = cheerio.load(data);
 return {
 meaning: $('section.about p').first().text().trim(),
 moreMeaning: $('section.about p').eq(1).text().trim(),
 shortcode: $('input[name="emoji"]').val()?.trim(),
 source: "emojipedia.org"
 };
 } catch {
 return null;
 }
 }
};