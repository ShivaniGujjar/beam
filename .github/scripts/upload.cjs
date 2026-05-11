const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const mime = require('mime-types');
const WebSocket = require('ws'); // 👈 Explicitly adding this

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)),
  },
  // WebSocket ka darr khatam karne ke liye ye line:
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

const PROJECT_ID = process.env.PROJECT_ID;
const DIST_PATH = path.join(process.cwd(), 'dist');

async function uploadFolder(folderPath, storagePath) {
    if (!fs.existsSync(folderPath)) {
        console.error(`❌ Folder not found: ${folderPath}`);
        return;
    }

    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const supabasePath = path.join(storagePath, file).replace(/\\/g, '/');

        if (fs.lstatSync(fullPath).isDirectory()) {
            await uploadFolder(fullPath, supabasePath);
        } else {
            const fileBuffer = fs.readFileSync(fullPath);
            const contentType = mime.lookup(fullPath) || 'application/octet-stream';

            const { error } = await supabase.storage
                .from('deployments') 
                .upload(`outputs/${PROJECT_ID}/${supabasePath}`, fileBuffer, {
                    contentType,
                    upsert: true
                });

            if (error) console.error(`❌ Error uploading ${file}:`, error.message);
            else console.log(`✅ Successfully uploaded: ${supabasePath}`);
        }
    }
}

console.log("🚀 Starting upload to Supabase...");
uploadFolder(DIST_PATH, '');