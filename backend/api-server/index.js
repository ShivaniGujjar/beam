require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 9000;
const JWT_SECRET = process.env.JWT_SECRET;

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 MongoDB Connected: Auth & Persistence Ready'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- MONGOOSE MODELS ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const deploymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectName: String,
    gitUrl: String,
    projectSlug: String,
    deployUrl: String,
    status: { type: String, default: 'Queued' },
    createdAt: { type: Date, default: Date.now }
});
const Deployment = mongoose.model('Deployment', deploymentSchema);

// --- REDIS SETUP ---
const publisher = new Redis(process.env.REDIS_URI);
const subscriber = new Redis(process.env.REDIS_URI);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Auth Middleware: To verify token and attach user to request
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attach user payload (id, email) to req
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or Expired Token' });
    }
};

// --- HTTP & SOCKET SERVER ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Redis Log Subscriber logic
subscriber.psubscribe('logs:*'); 
subscriber.on('pmessage', async (pattern, channel, message) => {
    const projectSlug = channel.split(':')[1];
    const data = JSON.parse(message);
    
    // Auto-update status in MongoDB based on build-server logs
    if (data.log.includes('DEPLOYMENT COMPLETE')) {
        await Deployment.findOneAndUpdate({ projectSlug }, { status: 'Live' });
    } else if (data.log.includes('Cloning')) {
        await Deployment.findOneAndUpdate({ projectSlug }, { status: 'Building' });
    }

    io.to(projectSlug).emit('message', data.log);
});

// --- AUTH ROUTES ---

// 1. User Signup
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword });
        res.json({ status: 'ok', message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists or invalid data' });
    }
});

// 2. User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        // Create JWT Token
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ status: 'ok', token, userId: user._id });
    }
    res.status(400).json({ error: 'Invalid credentials' });
});

// --- PROTECTED DEPLOYMENT ROUTES ---

// 3. Get Deployment History for logged-in user only
app.get('/deployments', authenticate, async (req, res) => {
    try {
        const history = await Deployment.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch deployments' });
    }
});

// 4. Initiate New Deployment
app.post('/project', authenticate, async (req, res) => {
    const { gitUrl, projectName } = req.body;

    // Logic for Slug
    const projectSlug = projectName 
        ? projectName.toLowerCase().replace(/ /g, '-') 
        : uuidv4().split('-')[0];
    
    const deployUrl = `http://localhost:8000/${projectSlug}.beam`;

    console.log(`🚀 Initiating deployment for: ${projectName} (User: ${req.user.id})`);

    try {
        // Step 1: Create entry in DB with User ID
        // Ensure req.user.id exists (comes from your 'authenticate' middleware)
        const newDeployment = await Deployment.create({
            userId: req.user.id,
            projectName,
            gitUrl,
            projectSlug,
            deployUrl,
            status: 'Queued'
        });

        console.log("✅ DB Entry Created:", newDeployment._id);

        // Step 2: Push work to Redis build-queue
        const queuePayload = JSON.stringify({ 
            gitUrl, 
            projectSlug, 
            projectName,
            deploymentId: newDeployment._id 
        });

        await publisher.lpush('build-queue', queuePayload);
        console.log("📡 Pushed to Redis Queue");

        return res.json({
            status: 'queued',
            data: { projectSlug, url: deployUrl }
        });

    } catch (error) {
        // Yeh console.log aapko backend terminal mein exact error dikhayega (e.g. MongoDB connection error)
        console.error("❌ DEPLOYMENT ROUTE ERROR:", error);

        res.status(500).json({ 
            error: 'Internal Server Error', 
            details: error.message // Frontend ko message bhej rahe hain for debugging
        });
    }
});

// --- SOCKET CONNECTION ---
io.on('connection', (socket) => {
    socket.on('subscribe', (projectSlug) => {
        socket.join(projectSlug);
        console.log(`📡 Socket: User joined room [${projectSlug}]`);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`🚀 Beam API Engine is live on port ${PORT}`);
    console.log(`🔒 Security: JWT & .env Protection Active`);
});