module.exports = {
 config: {
 name: "fdrq",
 aliases: [],
 version: "1.1",
 author: "Chitron Bhattacharjee",
 role: 1,
 category: "admin",
 shortDescription: {
 en: "Manage friend requests of the bot"
 },
 description: {
 en: "View, accept, or remove bot's friend requests with a unique code system"
 },
 guide: {
 en: "{pn}\n{pn} acc 123\n{pn} rm 456\n{pn} acc all\n{pn} rm all"
 }
 },

 onStart: async function ({ api, event, args }) {
 const { threadID, messageID } = event;
 const command = args[0]?.toLowerCase();
 const target = args[1]?.toLowerCase();

 global._fdrqList = global._fdrqList || [];

 // Step 1: Fetch and cache pending friend requests
 if (!command) {
 try {
 const inbox = await api.getThreadList(100, null, ["PENDING"]);
 const pending = inbox.filter(u => u.isSubscribed === false);

 if (pending.length === 0) {
 return api.sendMessage("✅ No pending friend requests found.", threadID, messageID);
 }

 global._fdrqList = pending.map(u => {
 return {
 name: u.name || "Unknown",
 id: u.threadID,
 code: Math.floor(Math.random() * 900 + 100)
 };
 });

 let listText = "📥 𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗙𝗥𝗜𝗘𝗡𝗗 𝗥𝗘𝗤𝗨𝗘𝗦𝗧𝗦\n━━━━━━━━━━━━━━━\n";
 for (const u of global._fdrqList) {
 listText += `🔹 ${u.name} - ${u.code}\n`;
 }

 listText += "\n✏️ Use:\n+fdrq acc [code] — accept\n+fdrq rm [code] — remove\n";
 listText += "+fdrq acc all — accept all\n+fdrq rm all — remove all";

 return api.sendMessage(listText, threadID, messageID);
 } catch (e) {
 return api.sendMessage(`❌ Error fetching requests: ${e.message}`, threadID, messageID);
 }
 }

 // Step 2: If requests not cached
 if (global._fdrqList.length === 0)
 return api.sendMessage("⚠️ No request cache found. First run `+fdrq` to list requests.", threadID, messageID);

 const action = command === "acc" ? "accept" : command === "rm" ? "reject" : null;
 if (!action || !target)
 return api.sendMessage("⚠️ Invalid usage. Example: +fdrq acc 123 or +fdrq rm all", threadID, messageID);

 // Step 3: Handle ALL
 if (target === "all") {
 const success = [];
 for (const u of global._fdrqList) {
 try {
 await api[action + "PendingJoinRequest"](u.id);
 success.push(u.name);
 } catch {}
 }

 return api.sendMessage(
 `✅ ${action === "accept" ? "Accepted" : "Removed"} ${success.length} requests:\n` +
 success.map(n => `• ${n}`).join("\n"),
 threadID
 );
 }

 // Step 4: Handle specific code
 const code = parseInt(target);
 if (isNaN(code)) return api.sendMessage("⚠️ Invalid code. Use numbers only.", threadID);

 const user = global._fdrqList.find(u => u.code === code);
 if (!user) return api.sendMessage("❌ No user found with this code.", threadID);

 try {
 await api[action + "PendingJoinRequest"](user.id);
 return api.sendMessage(`✅ ${action === "accept" ? "Accepted" : "Removed"}: ${user.name} (${code})`, threadID);
 } catch (err) {
 return api.sendMessage(`❌ Failed to ${action}: ${err.message}`, threadID);
 }
 }
};