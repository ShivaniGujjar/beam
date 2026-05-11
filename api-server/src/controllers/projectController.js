const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// --- 💡 MODEL SETUP ---
const ProjectSchema = new mongoose.Schema({
    gitUrl: { type: String, required: true },
    slug: { type: String, required: true },
    status: { type: String, default: 'QUEUED' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true }
}, { 
    timestamps: true,
    collection: 'deployments' 
});

const Project = mongoose.models.Deployment || mongoose.model('Deployment', ProjectSchema);

// --- 🚀 GITHUB TRIGGER FUNCTION ---
const triggerGitHubBuild = async (repoUrl, projectId) => {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO_OWNER = "ShivaniGujjar";
    const GITHUB_REPO_NAME = "beam";

    try {
        await axios.post(
            `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/dispatches`,
            {
                event_type: 'trigger-build',
                client_payload: {
                    repo_url: repoUrl,
                    project_id: projectId 
                }
            },
            {
                headers: {
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            }
        );
        console.log("🚀 GitHub Build Action Triggered!");
    } catch (error) {
        console.error("❌ GitHub Trigger Failed:", error.response ? error.response.data : error.message);
    }
};

// --- 🛠 CREATE DEPLOYMENT ---
exports.createDeployment = async (req, res) => {
    console.log("--- 🚀 Deployment Request Received ---");
    try {
        const { gitUrl, slug } = req.body;
        const authHeader = req.headers.authorization;
        
        if (!authHeader) return res.status(401).json({ error: "No Token" });
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // 1. Save to DB with initial status
        const newProject = await Project.create({ 
            gitUrl, 
            slug, 
            status: 'CLONING',
            userId: new mongoose.Types.ObjectId(userId) 
        }); 

        console.log(`✅ SAVED TO DEPLOYMENTS: ${newProject._id}`);

        // 2. ⚡️ SOCKET UPDATE: Send 'CLONING' status to frontend
        const io = req.app.get('io');
        if (io) {
            io.to(slug).emit('status', 'CLONING');
            console.log(`📡 Socket: Room ${slug} set to CLONING`);
        }

        // 3. Trigger the Build
        await triggerGitHubBuild(gitUrl, slug);

        res.status(201).json({ status: 'cloning', data: newProject });

    } catch (error) {
        console.error("❌ Controller Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// --- 📡 WEBHOOK: UPDATE BUILD STATUS ---
// GitHub Action aakhri step mein is endpoint ko hit karega
exports.updateBuildStatus = async (req, res) => {
    const { projectId, status } = req.body; // projectId = slug
    console.log(`📩 Webhook Received: Project ${projectId} is now ${status}`);

    try {
        // 1. Update status in Database
        const updatedProject = await Project.findOneAndUpdate(
            { slug: projectId }, 
            { status: status }, 
            { sort: { createdAt: -1 }, new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" });
        }

        // 2. ⚡️ SOCKET UPDATE: Send 'READY' or 'FAILED' to frontend
        const io = req.app.get('io');
        if (io) {
            io.to(projectId).emit('status', status);
            console.log(`📡 Socket: Room ${projectId} updated to ${status}`);
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
        if (!authHeader) return res.status(401).json({ error: "No Token" });
        
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