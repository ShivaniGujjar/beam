const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Redis = require('ioredis');

// Redis Publisher for triggering builds
const publisher = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

publisher.on('error', (err) => console.error('Redis Publisher Error ❌:', err.message));

// Schema & Model Alignment
const ProjectSchema = new mongoose.Schema({
    gitUrl: { type: String, required: true },
    slug: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['QUEUED', 'IN_PROGRESS', 'CLONING', 'READY', 'FAIL'], 
        default: 'QUEUED' 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { 
    timestamps: true,
    collection: 'deployments' 
});

const Project = mongoose.models.Deployment || mongoose.model('Deployment', ProjectSchema);

// Helper function to sanitize slug
const sanitizeSlug = (name) => {
    return name.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
};

// --- 🛠 CREATE DEPLOYMENT ---
exports.createDeployment = async (req, res) => {
    console.log("--- 🚀 Deployment Request Received ---");
    try {
        const { gitUrl, slug: rawSlug } = req.body;
        const authHeader = req.headers.authorization;
        
        if (!authHeader) return res.status(401).json({ error: "No Token Provided" });
        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_beam_key_123');
        } catch (jwtErr) {
            console.error("❌ JWT Verification Failed:", jwtErr.message);
            return res.status(401).json({ error: "Unauthorized: Token Invalid/Expired" });
        }

        const extractedUserId = decoded.id || decoded._id || decoded.userId;

        if (!extractedUserId || !mongoose.Types.ObjectId.isValid(extractedUserId)) {
             console.error("❌ Invalid User ID in Token Payload:", extractedUserId);
             return res.status(400).json({ error: "Invalid User Payload inside Token" });
        }

        const formattedSlug = sanitizeSlug(rawSlug);

        // 1. Save DB Record
        const newProject = await Project.create({ 
            gitUrl, 
            slug: formattedSlug, 
            status: 'CLONING',
            userId: new mongoose.Types.ObjectId(extractedUserId) 
        }); 

        console.log(`✅ SAVED TO DEPLOYMENTS: ${newProject._id} [Slug: ${formattedSlug}]`);

        // 2. ⚡️ REDIS EVENT PUBLISH (Triggers local build-server)
        await publisher.publish('build-tasks', JSON.stringify({ gitUrl, slug: formattedSlug }));
        console.log(`📢 Task published to Redis channel 'build-tasks' for slug: ${formattedSlug}`);

        // 3. Socket Event Emit
        const io = req.app.get('io');
        if (io) {
            io.to(formattedSlug).emit('status', 'CLONING');
            console.log(`📡 Socket: Room [${formattedSlug}] set to CLONING`);
        }

        res.status(201).json({ status: 'cloning', slug: formattedSlug, data: newProject });

    } catch (error) {
        console.error("❌ Controller Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// --- 📡 WEBHOOK: UPDATE BUILD STATUS ---
exports.updateBuildStatus = async (req, res) => {
    const { projectId, status } = req.body; 
    console.log(`📩 Webhook Received: Project ${projectId} is now ${status}`);

    try {
        const formattedSlug = sanitizeSlug(projectId);
        const updatedProject = await Project.findOneAndUpdate(
            { slug: formattedSlug }, 
            { status: status }, 
            { sort: { createdAt: -1 }, new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" });
        }

        const io = req.app.get('io');
        if (io) {
            io.to(formattedSlug).emit('status', status);
            console.log(`📡 Socket: Room [${formattedSlug}] updated to ${status}`);
        }

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        console.error("❌ Webhook Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// --- 📜 GET HISTORY ---
exports.getDeployments = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "No Token Provided" });
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_beam_key_123');

        const extractedUserId = decoded.id || decoded._id || decoded.userId;

        const deployments = await Project.find({ userId: new mongoose.Types.ObjectId(extractedUserId) })
            .sort({ createdAt: -1 });

        console.log(`📜 Found ${deployments.length} deployments`);
        res.status(200).json(deployments);
    } catch (error) {
        console.error("❌ Fetch History Failed:", error.message);
        res.status(500).json({ error: "Fetch history failed" });
    }
};