const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const mime = require('mime-types'); // File types handle karne ke liye

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const PROJECT_ID = process.env.PROJECT_ID;
const DIST_PATH = path.join(process.cwd(), 'dist');

async function uploadFolder(folderPath, storagePath) {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const supabasePath = path.join(storagePath, file).replace(/\\/g, '/');

        if (fs.lstatSync(fullPath).isDirectory()) {
            await uploadFolder(fullPath, supabasePath);
        } else {
            const fileBuffer = fs.readFileSync(fullPath);
            const contentType = mime.lookup(fullPath) || 'text/plain';

            const { error } = await supabase.storage
                .from('deployments') // Bucket name check kar lena
                .upload(`outputs/${PROJECT_ID}/${supabasePath}`, fileBuffer, {
                    contentType,
                    upsert: true
                });

            if (error) console.error(`Error uploading ${file}:`, error.message);
            else console.log(`Successfully uploaded: ${supabasePath}`);
        }
    }
}

// Build hone ke baad 'dist' folder ko upload karo
uploadFolder(DIST_PATH, '');