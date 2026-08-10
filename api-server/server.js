const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 💡 TEMPORARY DEBUG LOGS TO TRACK THE `.env` PARSING VALUE:
console.log("\n🔍 --- [DEBUG] ENVIRONMENT KEY VERIFICATION ---");
console.log("PORT Loaded:", !!process.env.PORT);
console.log("MONGO_URI Loaded:", !!process.env.MONGO_URI);
console.log("GITHUB_TOKEN Loaded:", !!process.env.GITHUB_TOKEN);
if (process.env.GITHUB_TOKEN) {
    console.log("GITHUB_TOKEN Character Length:", process.env.GITHUB_TOKEN.length);
} else {
    console.log("⚠️ GITHUB_TOKEN IS MISSING OR NULL IN PROCESS.ENV!");
}
console.log("-----------------------------------------------\n");

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 9000;
const server = http.createServer(app);

console.log("1. Database connect karne ja raha hoon...");
connectDB();

console.log("2. Socket init karne ja raha hoon...");
try {
    const io = initSocket(server);
    app.set('io', io); 
    console.log("3. Socket set ho gaya!");
} catch (err) {
    console.error("❌ Socket Error:", err);
}

server.listen(PORT, () => {
    console.log(`API Server is running on port ${PORT} 🚀`);
});