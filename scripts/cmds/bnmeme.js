const axios = require("axios");

module.exports = {
 config: {
 name: "bnmeme",
 version: "1.2",
 author: "Chitron Bhattacharjee",
 role: 0,
 category: "fun",
 shortDescription: {
 en: "Random Bengali/Indian meme from Reddit"
 },
 description: {
 en: "Fetches a random meme from r/BD_meme, r/IndianDankMemes or r/BanglaMemes"
 },
 guide: {
 en: "{pn} — Get a random meme from Bengali/Desi meme subs"
 }
 },

 onStart: async function ({ message }) {
 const subreddits = ["BD_meme", "IndianDankMemes", "BanglaMemes"];
 const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];

 try {
 const res = await axios.get(`https://www.reddit.com/r/${randomSub}/random.json`, {
 headers: { "User-Agent": "Mozilla/5.0 GoatBot Meme Fetcher" }
 });

 const post = res.data[0]?.data?.children[0]?.data;
 if (!post || post.over_18 || (!post.url.endsWith(".jpg") && !post.url.endsWith(".png") && !post.url.endsWith(".jpeg"))) {
 return message.reply("❌ Clean meme খুঁজে পাইনি, আবার চেষ্টা করুন!");
 }

 const caption = `🤣 ${post.title}\n👤 u/${post.author}\n🔺 ${post.ups} upvotes\n🌐 r/${randomSub}\n📎 https://redd.it/${post.id}`;

 return message.reply({
 body: caption,
 attachment: await global.utils.getStreamFromURL(post.url)
 });

 } catch (err) {
 return message.reply("❌ মিম আনতে সমস্যা হয়েছে:\n" + err.message);
 }
 }
};