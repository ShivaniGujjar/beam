const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/storage');
const mime = require('mime-types');

const runBuild = (projectPath, sendLog, slug) => {
    return new Promise((resolve, reject) => {
        sendLog("🛠️ Build sequence initiated...");
        
        // standard build commands
        const command = `npm install && npm run build`;
        
        const buildProcess = exec(command, { cwd: projectPath, shell: true });

        buildProcess.stdout.on('data', (data) => {
            if (data.toString().trim()) sendLog(`[BUILD]: ${data.toString().trim()}`);
        });

        buildProcess.on('close', async (code) => {
            if (code !== 0) return reject(new Error(`Build failed code ${code}`));
            
            sendLog("🏗️ Build finished! Starting Supabase upload logic...");
            
            try {
                // Vite projects use 'dist'
                const outputDir = path.join(projectPath, 'dist');
                if (!fs.existsSync(outputDir)) throw new Error("dist folder not found!");

                const files = fs.readdirSync(outputDir, { recursive: true });
                sendLog(`Found ${files.length} items to process.`);

                for (const file of files) {
                    const filePath = path.join(outputDir, file);
                    
                    if (fs.lstatSync(filePath).isDirectory()) continue;

                    const fileBuffer = fs.readFileSync(filePath);
                    const contentType = mime.lookup(filePath) || 'application/octet-stream';
                    
                    // 💡 WINDOWS FIX: Kisi bhi tarah ka slash ho, usey '/' mein badal do
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
                        sendLog(`❌ SUPABASE ERROR for ${cleanFileName}: ${error.message}`);
                        throw error;
                    }
                    sendLog(`✅ Success: ${cleanFileName}`);
                }
                
                sendLog("🏁 ALL FILES UPLOADED SUCCESSFULLY!");
                resolve();
            } catch (err) {
                sendLog(`❌ CRITICAL UPLOAD FAIL: ${err.message}`);
                reject(err);
            }
        });
    });
};

module.exports = { runBuild };