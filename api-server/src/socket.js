const { Server } = require('socket.io');
const Redis = require('ioredis');

const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    // 💡 Debug: Check kijiye ki socket file ko Redis URL mil raha hai ya nahi
    if (!process.env.REDIS_URL) {
        console.error("❌ Socket.js Error: REDIS_URL not found in environment!");
    }

    const logSubscriber = new Redis(process.env.REDIS_URL);
    
    logSubscriber.on('connect', () => console.log('Socket Log Subscriber connected to Redis 🔌'));
    logSubscriber.on('error', (err) => console.error('Redis Socket Subscriber Error ❌:', err.message));

    logSubscriber.psubscribe('logs:*', (err, count) => {
        if (err) console.error("Failed to psubscribe:", err.message);
        else console.log(`Subscribed to logs. Listening on ${count} patterns.`);
    });

    logSubscriber.on('pmessage', (pattern, channel, message) => {
        try {
            const slug = channel.split(':')[1];
            const parsedData = JSON.parse(message);
            const log = parsedData.log;
            
            // 💡 Dashboard update trigger
            io.to(slug).emit('message', log);
            console.log(`📡 Relaying log for [${slug}]: ${log}`); 
        } catch (e) {
            console.error("Error parsing Redis message:", e.message);
        }
    });

    io.on('connection', (socket) => {
        console.log('Client Connected:', socket.id);
        
        socket.on('subscribe', (slug) => {
            socket.join(slug);
            console.log(`✅ User joined room: ${slug}`);
        });

        socket.on('disconnect', () => {
            console.log('Client Disconnected');
        });
    });

    return io;
};

module.exports = { initSocket };