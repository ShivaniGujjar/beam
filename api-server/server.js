const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 9000;
const server = http.createServer(app);

connectDB();

// 💡 Socket ko init karke app mein set kar rahe hain
const io = initSocket(server);
app.set('io', io); 

server.listen(PORT, () => {
    console.log(`API Server is running on port ${PORT} 🚀`);
});