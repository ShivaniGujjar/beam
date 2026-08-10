const { Server } = require('socket.io');
const Redis = require('ioredis');

const initSocket = (server) => {
    const io = new Server(server, {
        cors: { 
            origin: ["http://localhost:5173", "http://localhost:3000", "*"], 
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    if (!process.env.REDIS_URL) {
        console.error("❌ Socket.js Error: REDIS_URL not found in environment!");
    }

    const logSubscriber = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false
    });
    
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
            
            // Dual emit so frontend hooks catch it reliably
            io.to(slug).emit('message', log);
            io.to(slug).emit('log', log);
            console.log(`📡 Relaying log for [${slug}]: ${log}`); 
        } catch (e) {
            console.error("Error parsing Redis message:", e.message);
        }
    });

    io.on('connection', (socket) => {
        console.log('Client Connected:', socket.id);
        
        socket.on('subscribe', (slug) => {
            const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
            socket.join(formattedSlug);
            console.log(`✅ Socket ${socket.id} joined room: ${formattedSlug}`);
        });

        socket.on('disconnect', () => {
            console.log('Client Disconnected');
        });
    });

    return io;
};

module.exports = { initSocket };