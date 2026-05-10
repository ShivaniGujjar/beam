const express = require('express');
const axios = require('axios');
const mime = require('mime-types');

const app = express();
const PORT = 8000;

const BASE_TARGET = 'https://raxeapbmgaokvvivfymi.supabase.co/storage/v1/object/public/deployments/outputs';

let lastSlug = ""; 

app.use(async (req, res) => {
    const p = req.path; 
    let slug = "";
    let file = "";

    // 1. Agar URL mein .beam hai (e.g. /project-1.beam)
    if (p.includes('.beam')) {
        slug = p.split('/')[1].replace('.beam', '');
        lastSlug = slug;
        file = "index.html";
    } 
    // 2. Agar assets hain (Vite projects ke liye)
    else if (p.startsWith('/assets/')) {
        slug = lastSlug;
        file = p.substring(1); 
    }
    // 3. Normal files ya sub-folders
    else {
        const parts = p.split('/').filter(x => x);
        if (parts.length >= 2) {
            slug = parts[0];
            file = parts.slice(1).join('/');
        } else {
            slug = parts[0] || lastSlug;
            file = "index.html";
        }
    }

    if (!slug) return res.status(404).send("Project slug not found. Visit project.beam first.");

    const finalUrl = `${BASE_TARGET}/${slug}/${file}`;

    try {
        console.log(`🚀 Proxying: ${finalUrl}`);
        const response = await axios.get(finalUrl, { responseType: 'arraybuffer' });

        const contentType = mime.lookup(file) || 'text/html';
        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error(`❌ 404: ${finalUrl}`);
        res.status(404).send(`404: File not found in Supabase at ${slug}/${file}`);
    }
});

app.listen(PORT, () => console.log(`🚀 Proxy Engine LIVE on ${PORT}`));