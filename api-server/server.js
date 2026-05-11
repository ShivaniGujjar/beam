const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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