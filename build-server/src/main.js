const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const express = require('express');

// 1. 💡 DOTENV LOADING (Local Fallback + Cloud Direct process.env)
try {
    require('dotenv').config();
} catch (e) {
    console.log("Running in Cloud environment without local .env file");
}

// 2. 💡 MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("❌ FATAL ERROR: MONGO_URI not found in environment!");
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

const subscriber = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false });
const publisher = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null, enableReadyCheck: false });

subscriber.on('connect', () => console.log('✅ Subscriber connected to Upstash Redis'));
subscriber.on('error', (err) => console.error('❌ Redis Subscriber Error:', err.message));

publisher.on('connect', () => console.log('✅ Publisher connected to Upstash Redis'));
publisher.on('error', (err) => console.error('❌ Redis Publisher Error:', err.message));

const { runBuild } = require('./services/builder'); 

// 4. 💡 MAIN REDIS SUBSCRIPTION LOGIC
subscriber.subscribe('build-tasks', (err, count) => {
    if (err) {
        console.error("❌ Failed to subscribe to build-tasks channel:", err.message);
    } else {
        console.log(`📡 Subscribed to build-tasks queue. Listening on ${count} channel(s)...`);
    }
});

subscriber.on('message', async (channel, message) => {
    if (channel !== 'build-tasks') return;
    
    console.log("📩 Raw Task Message Received from Redis:", message);
    let projectSlug = '';
    
    try {
        const { gitUrl, slug } = JSON.parse(message);
        projectSlug = slug.trim(); 

        const sendLog = (log) => {
            publisher.publish(`logs:${projectSlug}`, JSON.stringify({ log }));
            console.log(`[${projectSlug}]: ${log}`);
        };

        // Update status to IN_PROGRESS
        await Project.findOneAndUpdate({ slug: projectSlug }, { status: 'IN_PROGRESS' });
        sendLog("🚀 Deployment Started...");

        const tempBaseDir = path.resolve('/tmp', 'build-temp');
        const projectPath = path.join(tempBaseDir, projectSlug);

        if (!fs.existsSync(tempBaseDir)) {
            fs.mkdirSync(tempBaseDir, { recursive: true });
        }

        sendLog("📂 Cloning Repository...");
        if (fs.existsSync(projectPath)) {
            fs.rmSync(projectPath, { recursive: true, force: true });
        }

        // Git Clone
        execSync(`git clone ${gitUrl} "${projectPath}"`, { stdio: 'inherit' });
        sendLog("✅ Repository Cloned Successfully!");

        if (fs.existsSync(projectPath)) {
            // Trigger build
            await runBuild(projectPath, sendLog, projectSlug); 
            
            // Status READY
            await Project.findOneAndUpdate({ slug: projectSlug }, { status: 'READY' });
            sendLog("✅ DEPLOYMENT COMPLETE");
            
            // Emit final socket trigger status
            publisher.publish(`logs:${projectSlug}`, JSON.stringify({ status: 'READY' }));
        } else {
            throw new Error("Cloned directory not found.");
        }

    } catch (error) {
        console.error(`❌ Build Task Failed:`, error.message);
        if (projectSlug) {
            await Project.findOneAndUpdate({ slug: projectSlug }, { status: 'FAIL' });
            publisher.publish(`logs:${projectSlug}`, JSON.stringify({ 
                log: `❌ Error: ${error.message}` 
            }));
        }
    }
});

// 5. 💡 EXPRESS PORT BINDING FOR RENDER HEALTH CHECKS
const app = express();
const PORT = process.env.PORT || 9001;

app.get('/', (req, res) => {
    res.send('Beam Build Server Worker is Live & Listening for Redis Tasks! 🚀');
});

app.listen(PORT, () => {
    console.log(`✅ Port binding active on port ${PORT} for Render health checks.`);
});