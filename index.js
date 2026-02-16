require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { google } = require("googleapis");

// ====== CONFIG ======
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const auth = new google.auth.GoogleAuth({
    keyFile: "credential-gcp-sheet.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const spreadsheetId = process.env.SPREADSHEET_ID;

// ====== START BOT ======
console.log("Bot is running... 🚀");

// Command start
bot.onText(/\/start/, (msg) => {
bot.sendMessage(msg.chat.id, "Bot aktif ✅ Kirim pesan apapun untuk disimpan ke Google Sheet.");
});

// Save message to Google Sheet
bot.on("message", async (msg) => {
    const text = msg.text;

    // Kalau bukan text, skip
    if (!text) return;

    // Hanya proses kalau diawali "!"
    if (!text.startsWith("!")) return;

    const chatId = msg.chat.id;
    const username = msg.from.username || "";
    const cleanText = text.substring(1).trim(); // hapus "!"
    const date = new Date().toISOString();

    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: "v4", auth: client });

        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: "Sheet1!A:D",
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [
                [
                    msg.from.id,
                    msg.from.username || "",
                    msg.text,
                    new Date().toISOString()
                ]
                ]
            }
        });

        bot.sendMessage(chatId, "Tersimpan ✅");
    } catch (error) {
        console.error("Error:", error.message);
        bot.sendMessage(chatId, "Error ❌");
    }
});