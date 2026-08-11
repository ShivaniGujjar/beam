const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/storage');
const mime = require('mime-types');

const runBuild = (projectPath, sendLog, slug) => {
    return new Promise((resolve, reject) => {
        sendLog("🛠️ Build sequence initiated...");
        
        // 💡 FIXED: Explicitly devDependencies install hone do taaki Vite plugins mil sakein
        const command = `npm install --include=dev --prefer-offline --no-audit --no-fund && npx vite build`;
        
        const buildProcess = exec(command, { 
            cwd: projectPath, 
            shell: true,
            // 💡 Removed NODE_ENV=production so devDependencies aren't pruned during install
            env: { ...process.env }
        });

        // Capture Standard Output
        buildProcess.stdout.on('data', (data) => {
            const msg = data.toString().trim();
            if (msg) sendLog(`[BUILD]: ${msg}`);
        });

        // Capture Standard Error
        buildProcess.stderr.on('data', (data) => {
            const msg = data.toString().trim();
            if (msg) sendLog(`[BUILD STDERR]: ${msg}`);
        });

        buildProcess.on('close', async (code) => {
            if (code !== 0) return reject(new Error(`Build failed code ${code}`));
            
            sendLog("🏗️ Build finished! Starting Supabase upload logic...");
            
            try {
                const outputDir = path.join(projectPath, 'dist');
                if (!fs.existsSync(outputDir)) throw new Error("dist folder not found!");

                const files = fs.readdirSync(outputDir, { recursive: true });
                sendLog(`Found ${files.length} items to process.`);

                for (const file of files) {
                    const filePath = path.join(outputDir, file);
                    
                    if (fs.lstatSync(filePath).isDirectory()) continue;

                    const fileBuffer = fs.readFileSync(filePath);
                    const contentType = mime.lookup(filePath) || 'application/octet-stream';
                    
                    const cleanFileName = file.replace(/\\/g, '/');
                    const storagePath = `outputs/${slug}/${cleanFileName}`;
                    
                    sendLog(`🚀 Attempting upload: ${cleanFileName}`);

                    const { data, error } = await supabase.storage
                        .from('deployments') 
                        .upload(storagePath, fileBuffer, {
                            contentType: contentType,
                            upsert: true
                        });

                    if (error) {
                        console.error("❌ RAW SUPABASE ERROR:", error);
                        sendLog(`❌ SUPABASE ERROR for ${cleanFileName}: ${error.message || JSON.stringify(error)}`);
                        throw error;
                    }
                    sendLog(`✅ Success: ${cleanFileName}`);
                }
                
                sendLog("🏁 ALL FILES UPLOADED SUCCESSFULLY!");
                resolve();
            } catch (err) {
                sendLog(`❌ CRITICAL UPLOAD FAIL: ${err.message || err}`);
                reject(err);
            }
        });
    });
};

module.exports = { runBuild };