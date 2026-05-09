require('dotenv').config();
const Redis = require('ioredis');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const mime = require('mime-types');

// --- CONFIGURATION & CONNECTIONS ---
const REDIS_URI = process.env.REDIS_URI || 'aapka_upstash_url_yahan';

// Redis options to prevent DNS/Retry crashes
const redisOptions = {
    maxRetriesPerRequest: null, 
    enableReadyCheck: false
};

const subscriber = new Redis(REDIS_URI, redisOptions);
const publisher = new Redis(REDIS_URI, redisOptions);

const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_KEY
);

// --- HELPERS ---

// Frontend ko live logs bhejne ke liye
function publishLog(projectSlug, message) {
    publisher.publish(`logs:${projectSlug}`, JSON.stringify({ log: message }));
    console.log(`[${projectSlug}]: ${message}`);
}

// Build folder ko Supabase Storage par "Beam" karne ke liye
async function uploadFolder(folderPath, projectSlug) {
    const files = fs.readdirSync(folderPath, { recursive: true });
    
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        if (fs.lstatSync(filePath).isDirectory()) continue;

        const fileContent = fs.readFileSync(filePath);
        const contentType = mime.lookup(filePath) || 'application/octet-stream';
        const fileNameForStorage = file.replace(/\\/g, '/');

        const { error } = await supabase.storage
            .from('deployments')
            .upload(`outputs/${projectSlug}/${fileNameForStorage}`, fileContent, {
                contentType,
                upsert: true
            });

        if (error) {
            publishLog(projectSlug, `❌ Error uploading ${file}: ${error.message}`);
        } else {
            publishLog(projectSlug, `🚀 Beamed: ${fileNameForStorage}`);
        }
    }
}

// --- MAIN ENGINE ---

async function init() {
    publishLog('system', '👷 Beam Build Server is online and listening...');

    while (true) {
        try {
            // Queue se next build job uthana
            const res = await subscriber.brpop('build-queue', 0);
            if (!res) continue;

            const { gitUrl, projectSlug, projectName } = JSON.parse(res[1]);
            const cleanGitUrl = gitUrl.trim();
            const projectPath = path.join(__dirname, 'temp', projectSlug);

            publishLog(projectSlug, `🔨 Starting build for ${projectName || projectSlug}`);

            // ✅ STEP 1: FORCE CLEANUP (Purana data delete karna)
            if (fs.existsSync(projectPath)) {
                publishLog(projectSlug, `🧹 Cleaning up existing directory...`);
                fs.rmSync(projectPath, { recursive: true, force: true });
            }

            publishLog(projectSlug, `📦 Cloning repository...`);

            // ✅ STEP 2: GIT CLONE
            exec(`git clone ${cleanGitUrl} "${projectPath}"`, (err) => {
                if (err) {
                    publishLog(projectSlug, `❌ Clone Error: ${err.message}`);
                    return;
                }

                publishLog(projectSlug, `✅ Clone complete. Installing dependencies...`);

                // ✅ STEP 3: INSTALL & BUILD
                const buildProcess = exec(`npm install && npm run build`, { 
                    cwd: projectPath,
                    shell: true 
                });

                // Streaming logs to dashboard
                buildProcess.stdout.on('data', (data) => {
                    const logLine = data.toString().trim();
                    if(logLine.toLowerCase().includes('build')) {
                        publishLog(projectSlug, logLine);
                    }
                });

                buildProcess.on('close', async (code) => {
                    if (code === 0) {
                        // Check for 'dist' or 'build' folder
                        const distPath = fs.existsSync(path.join(projectPath, 'dist')) 
                            ? path.join(projectPath, 'dist') 
                            : path.join(projectPath, 'build');

                        if (fs.existsSync(distPath)) {
                            publishLog(projectSlug, `✨ Build successful. Beaming to cloud...`);
                            
                            // ✅ STEP 4: UPLOAD TO SUPABASE
                            await uploadFolder(distPath, projectSlug);
                            
                            publishLog(projectSlug, `\n🌎 DEPLOYMENT COMPLETE!`);
                            publishLog(projectSlug, `🔗 Your Link: http://localhost:8000/${projectSlug}.beam`);
                        } else {
                            publishLog(projectSlug, `❌ Error: No build folder (dist/build) found.`);
                        }
                    } else {
                        publishLog(projectSlug, `❌ Build failed with code ${code}`);
                    }
                });
            });

        } catch (error) {
            console.error('❌ System Error:', error.message);
            // Wait slightly before retrying in case of network blips
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Start the server
init();