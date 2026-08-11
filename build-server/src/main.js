const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const express = require('express'); // 👈 Express add kiya

// 1. 💡 BULLETPROOF DOTENV LOADING
const possiblePaths = [
    path.resolve(__dirname, '../../.env'), 
    path.resolve(__dirname, '../.env'),     
    path.resolve(process.cwd(), '.env'),     
];

let envLoaded = false;
for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        console.log(`✅ CONFIG: .env loaded from: ${envPath}`);
        envLoaded = true;
        break;
    }
}

// 2. 💡 MONGODB CONNECTION (Wait for Env)
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ FATAL ERROR: MONGO_URI not found in .env file!");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Build Server connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// Project Schema for status updates
const Project = mongoose.models.Deployment || mongoose.model('Deployment', new mongoose.Schema({
    slug: String,
    status: String
}, { collection: 'deployments' }));

// 3. 💡 REDIS SETUP
if (!process.env.REDIS_URL) {
    console.error("❌ FATAL ERROR: REDIS_URL not found!");
    process.exit(1);
}

const subscriber = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
const publisher = new Redis(process.env.REDIS_URL);

const { runBuild } = require('./services/builder'); 

console.log("🚀 Build Server Listening for Tasks...");

// 4. 💡 MAIN LOGIC
subscriber.subscribe('build-tasks');

subscriber.on('message', async (channel, message) => {
    if (channel !== 'build-tasks') return;
    
    let projectSlug = '';
    try {
        const { gitUrl, slug } = JSON.parse(message);
        projectSlug = slug.trim(); 

        const sendLog = (log) => {
            publisher.publish(`logs:${projectSlug}`, JSON.stringify({ log }));
            console.log(`[${projectSlug}]: ${log}`);
        };

        // Update status to IN_PROGRESS (Taaki UI par Yellow ho jaye)
        await Project.findOneAndUpdate({ slug: projectSlug }, { status: 'IN_PROGRESS' });
        sendLog("🚀 Deployment Started...");

        const tempBaseDir = path.resolve(__dirname, '../../temp');
        const projectPath = path.join(tempBaseDir, projectSlug);

        if (!fs.existsSync(tempBaseDir)) {
            fs.mkdirSync(tempBaseDir, { recursive: true });
        }

        sendLog("📂 Cloning Repository...");
        if (fs.existsSync(projectPath)) {
            fs.rmSync(projectPath, { recursive: true, force: true });
        }

        execSync(`git clone ${gitUrl} "${projectPath}"`, { stdio: 'inherit' });
        sendLog("✅ Repository Cloned Successfully!");

        if (fs.existsSync(projectPath)) {
            // Trigger build
            await runBuild(projectPath, sendLog, projectSlug); 
            
            // ✅ FINAL UPDATE: Status READY (UI par Green ho jaye)
            await Project.findOneAndUpdate({ slug: projectSlug }, { status: 'READY' });
            sendLog("✅ DEPLOYMENT COMPLETE");
        } else {
            throw new Error("Cloned directory not found.");
        }

    } catch (error) {
        console.error(`❌ Build Task Failed:`, error.message);
        if (projectSlug) {
            // Status FAIL update
            await Project.findOneAndUpdate({ slug: projectSlug }, { status: 'FAIL' });
            publisher.publish(`logs:${projectSlug}`, JSON.stringify({ 
                log: `❌ Error: ${error.message}` 
            }));
        }
    }
});

// 5. 💡 DUMMY EXPRESS PORT BINDING FOR RENDER WEB SERVICE
const app = express();
const PORT = process.env.PORT || 9001;

app.get('/', (req, res) => {
    res.send('Beam Build Server Worker is Live & Listening for Redis Tasks! 🚀');
});

app.listen(PORT, () => {
    console.log(`✅ Port binding active on port ${PORT} for Render health checks.`);
});