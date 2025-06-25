
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
 config: {
 name: "emojimean",
 alias: ["em", "emoji"],
 version: "2.2",
 author: "NTKhang + Modified by ChatGPT",
 countDown: 5,
 role: 0,
 description: {
 en: "Find emoji meaning with multiple search methods"
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
 tryingAlternative: "🔍 Trying different search method..."
 }
 },

 onStart: async function ({ args, message, getLang }) {
 try {
 const emoji = args.join(" ").trim();
 if (!emoji) return message.reply(getLang("missingEmoji"));

 let result, source;

 if ((result = await this.searchEmojipediaDirect(emoji))) {
 source = "emojipedia.org (search)";
 } else if ((result = await this.searchEmojipediaUnicode(emoji))) {
 source = "emojipedia.org (unicode)";
 } else if ((result = await this.searchEmojiApi(emoji))) {
 source = "emojihub.yurace.pro";
 }

 if (!result) return message.reply(getLang("notFound"));

 return message.reply(getLang(
 "meaningOfEmoji",
 emoji,
 result.meaning || "No description available",
 result.moreMeaning || "No additional information",
 result.shortcode || "No shortcode",
 source || "Unknown source"
 ));

 } catch (error) {
 console.error("Error:", error);
 if (error.response?.status === 429) {
 return message.reply(getLang("manyRequest"));
 }
 return message.reply(getLang("error"));
 }
 },

 searchEmojipediaDirect: async function (emoji) {
 try {
 const url = `https://emojipedia.org/search/?q=${encodeURIComponent(emoji)}`;
 const { data } = await axios.get(url, {
 timeout: 8000,
 headers: {
 'User-Agent': 'Mozilla/5.0'
 }
 });

 const $ = cheerio.load(data);
 const firstResult = $('.search-results .search-result a').first();
 if (!firstResult.length) return null;

 const emojiPage = await axios.get(`https://emojipedia.org${firstResult.attr('href')}`);
 const $$ = cheerio.load(emojiPage.data);

 return {
 meaning: $$('section.about p').first().text().trim(),
 moreMeaning: $$('section.about p').eq(1).text().trim(),
 shortcode: $$('section .shortcode input').val()?.trim() || null
 };
 } catch {
 return null;
 }
 },

 searchEmojipediaUnicode: async function (emoji) {
 try {
 const codePoints = Array.from(emoji).map(char =>
 char.codePointAt(0).toString(16).toLowerCase()
 ).join('-');
 const url = `https://emojipedia.org/u+${codePoints}/`;

 const { data } = await axios.get(url, {
 timeout: 8000,
 headers: { 'User-Agent': 'Mozilla/5.0' }
 });

 const $ = cheerio.load(data);
 return {
 meaning: $('section.about p').first().text().trim(),
 moreMeaning: $('section.about p').eq(1).text().trim(),
 shortcode: $('section .shortcode input').val()?.trim() || null
 };
 } catch {
 return null;
 }
 },

 searchEmojiApi: async function (emoji) {
 try {
 const { data } = await axios.get(`https://emojihub.yurace.pro/api/all`, {
 timeout: 8000
 });

 const found = data.find(e => e.unicode.includes(emoji));
 if (!found) return null;

 return {
 meaning: found.name,
 moreMeaning: `Category: ${found.category}`,
 shortcode: found.htmlCode[0]
 };
 } catch {
 return null;
 }
 }
};