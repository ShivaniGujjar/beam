const axios = require('axios'); // 👈 Install using: npm install axios
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
                    project_id: projectId // Hamara slug/project identifier
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

        // --- ⚡️ TRIGGER GITHUB ACTION INSTEAD OF REDIS ---
        await triggerGitHubBuild(gitUrl, slug);

        res.status(201).json({ status: 'queued', data: newProject });

    } catch (error) {
        console.error("❌ Controller Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

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