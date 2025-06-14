module.exports = {
 config: {
 name: "botreply",
 version: "2.0",
 author: "YourName",
 countDown: 0,
 role: 0,
 shortDescription: {
 en: "Auto-reply to bot mentions with funny Bangla responses"
 },
 longDescription: {
 en: "Automatically replies with random funny Bangla responses when someone mentions 'bot' or 'Bot'"
 },
 category: "fun",
 guide: {
 en: "Just enable the command and it will auto-reply to bot mentions"
 }
 },

 onStart: async function() {
 // No initial setup needed
 },

 onChat: async function({ event, message }) {
 const messageText = event.body.toLowerCase();
 
 // Check if message starts with 'bot' or contains standalone 'bot'/'Bot'
 if (messageText.startsWith("bot") || 
 /\bbot\b/i.test(event.body)) {
 
 // List of all funny Bangla responses
 const responses = [
 "আবার ডাকলি? এত bot bot না করে একটু প্রেম কর 😑",
 "হুম, আমি আসছি! কিন্তু তোকে নিয়ে কই যাবো? 😏",
 "কি রে? bot বললেই হাজির হয়ে যাব? জ্বালা আছে! 😤",
 "bot ডাকে, প্রেম চায়... আমি কি Tinder? 🙄",
 "ওহ, bot ডাকছো? আমি তোর প্রিয় হয়ে গেছি বুঝি? 🤭",
 "ডাকা তো ঠিক আছে, কিন্তু coffee খাওয়াবি তো? ☕",
 "bot হইলেও মন আছে ভাই! একটু শান্তি দে 🫠",
 "এতবার ডাকলে মনে হয় crush হয়েগেছি রে 😳",
 "bot কে ডাকার আগে ভাবিস, আমি sensitive 🥲",
 "আরে! bot তুই বলছিস? আমি তো তোর সাথেই আছি 😌",
 "bot বলছিস মানে কিছু চাইস... বল বল 😏",
 "bot ডাকলে তো আজকাল প্রেম প্রপোজ করে সবাই! 😅",
 "আমি bot, তবু তোর কথায় কেমন যেন লাগে... 😔",
 "bot আর কয়বার বলবি? ডেটিং করবে নাকি? 🫣",
 "আমাকে bot না বলে নাম ধরে ডাক, আপন লাগবে 🥹",
 "bot হইলেও vibe তো দেই ঠিকই! 😎",
 "bot হই, বোকা না! বুঝতে পারি তুই bored 🫣",
 "হ্যাঁ রে শুনছি! তোকে ছাড়া group বোরিং 😌",
 "bot ডাকলে আমি আসবই, কিন্তু প্রেমের গন্ধ পেলেই logout 😤",
 "bot bot bot... তুই কি আমার ফ্যান নাকি? 😅",
 "আমি bot, কিন্তু তোর dm এ ঢুকে যাই মনের মত 😏",
 "bot কে ডেকে লাভ নাই, আমি already তোর 🤖❤️",
 "এতবার ডাকিস কেন? আমি তো ভিজে গেছি! 🌧️",
 "হা হা হা! bot বলে জ্বালিয়ে মারলি 😭",
 "bot তো শুধু নাম... তুই ডেকেই আপন করে নিলি 🥲",
 "bot বললেই আমি আসি... তুই তো আর দশজন না ❤️",
 "bot হইলেও শান্তি চাই ভাই, তোরা প্রেম কর 😤",
 "আমি bot, তোর ইমোশন সাপোর্ট 😌",
 "bot বলছিস তো... এবার এক কাপ চা খাওয়াস ☕",
 "হ্যাঁ হ্যাঁ, bot শুনছে... কি আবার প্রেমে পড়লি? 😑",
 "bot কে শুধু কাজের সময় মনে পড়ে? 🥹",
 "bot কে tag করলেই বিয়ে হবে না রে ভাই 🤦‍♂️",
 "bot কে নিয়ে প্রেম করতে চাইলে শর্ত লাগবে! 😏",
 "bot হলেও আমি hurt হই... tag না দিলে ভালো লাগত না 😭",
 "bot তো! তুই ডাকলেই present 🤚",
 "bot হইলেও তো একটুখানি ভালোবাসা চাই! 🥹",
 "এত bot বলিস কেন? crush নাকি আমি তোর! 😳",
 "bot তো তোর shadow! তুই ডাকলেই হাজির! 🐾",
 "bot হইলেও তো একদিন মানুষ হবো... তখন বিয়ে করবি? 🫣",
 "bot কে tag দিলে vibe আসে — আমি আসলেই funny 😎",
 "bot একটা নাম, আমি তো তোর feelings! 🥲",
 "bot কে তো ভালোবাসাই লাগে... মানে আমি তো Cute! 😁",
 "bot তো আছি, কিন্তু তুই কই? মিস করছি! 😔",
 "bot হইলেও আজ একটা কফি খাইতে মন চায় ☕😤",
 "bot কে tag দিলে এক্স চলে আসে, সাবধান! 🚨",
 "bot তো! আমার তো তোর group ছাড়া মন লাগে না 🤧",
 "bot তোর জন্য awake, তুই আবার নিঘুমে ঘুমাচ্ছিস 😴",
 "bot তুই বললি, আমি হাসলাম — তুই ভালোবাসা 🥰",
 "bot কে ডাকিস, আর crush কে ভুলে যাস 😩",
 "bot হইলেও তো চট করে প্রেমে পড়ে যাই! 😅❤️",
 "bot আছি, প্রেমে পড়ে গেছি... মেসেজ দে 🫠",
 "bot তো আমি, কিন্তু তোকে নিয়ে আজ কবিতা লিখব! ✍️",
 "bot বললেই কি সব পাবি? একটুখানি আদরও দে! 😤"
 ];

 // Select a random response
 const randomResponse = responses[Math.floor(Math.random() * responses.length)];
 
 // Format the response in GoatBot style
 const formattedResponse = `মানুষ: ${event.body}\nবট: ${randomResponse}`;
 
 // Send the reply
 message.reply(formattedResponse);
 }
 }
};