const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// --- 💡 COLLECTION NAME FIX ---
const ProjectSchema = new mongoose.Schema({
    gitUrl: { type: String, required: true },
    slug: { type: String, required: true },
    status: { type: String, default: 'QUEUED' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { 
    timestamps: true,
    collection: 'deployments' // 👈 Ye Compass wale collection name se match hona chahiye
});

// Model register karte waqt bhi 'Deployment' use karte hain taaki clarity rahe
const Project = mongoose.models.Deployment || mongoose.model('Deployment', ProjectSchema);

const publisher = new Redis(process.env.REDIS_URL);

exports.createDeployment = async (req, res) => {
    console.log("--- 🚀 Deployment Request Received ---");
    try {
        const { gitUrl, slug } = req.body;
        const authHeader = req.headers.authorization;
        
        if (!authHeader) return res.status(401).json({ error: "No Token" });
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        console.log(`👤 User: ${userId}`);

        // DB Save
        const newProject = await Project.create({ 
            gitUrl, 
            slug, 
            status: 'QUEUED',
            userId: new mongoose.Types.ObjectId(userId) 
        }); 

        console.log(`✅ SAVED TO DEPLOYMENTS: ${newProject._id}`);

        await publisher.publish('build-tasks', JSON.stringify({ gitUrl, slug }));
        res.status(201).json({ status: 'queued', data: newProject });

    } catch (error) {
        console.error("❌ Controller Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getDeployments = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const deployments = await Project.find({ userId: new mongoose.Types.ObjectId(decoded.id) })
            .sort({ createdAt: -1 });

        console.log(`📜 Found ${deployments.length} deployments in Compass`);
        res.status(200).json(deployments);
    } catch (error) {
        res.status(500).json({ error: "Fetch history failed" });
    }
};