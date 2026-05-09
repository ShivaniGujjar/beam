const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8000;
const BASE_TARGET = 'https://raxeapbmgaokvvivfymi.supabase.co/storage/v1/object/public/deployments/outputs';

let lastSlug = ""; 

app.use(async (req, res) => {
    let fullPath = req.path;

    // 1. .beam Branded URL handle karna (e.g., /e6d33323.beam)
    if (fullPath.includes('.beam')) {
        const slug = fullPath.split('/')[1].split('.beam')[0];
        lastSlug = slug;
        // Agar URL sirf slug.beam hai, toh use index.html par bhej do
        fullPath = `/${slug}/index.html`;
    } 
    // 2. Slug extraction for normal paths (e.g., /e6d33323/index.html)
    else {
        const slugMatch = fullPath.match(/^\/([a-z0-9]{8})/);
        if (slugMatch) {
            lastSlug = slugMatch[1];
        } 
        // 3. Asset handling logic (agar slug URL mein nahi hai par assets mang raha hai)
        else if (fullPath.startsWith('/assets/') && lastSlug) {
            fullPath = `/${lastSlug}${fullPath}`;
        }
    }

    if (fullPath === '/' || fullPath === '') {
        return res.status(400).send('Usage: http://localhost:8000/your-slug.beam');
    }

    const finalUrl = `${BASE_TARGET}${fullPath}`;

    try {
        console.log(`🚀 Beaming from: ${finalUrl}`);
        const response = await axios.get(finalUrl, { responseType: 'arraybuffer' });

        // MIME Types handling
        let contentType = 'text/html';
        if (fullPath.endsWith('.css')) contentType = 'text/css';
        else if (fullPath.endsWith('.js')) contentType = 'application/javascript';
        else if (fullPath.endsWith('.svg')) contentType = 'image/svg+xml';
        else if (fullPath.endsWith('.png')) contentType = 'image/png';
        else if (fullPath.endsWith('.jpg') || fullPath.endsWith('.jpeg')) contentType = 'image/jpeg';

        res.set('Content-Type', contentType);
        res.send(response.data);
    } catch (error) {
        console.error(`❌ Beam Error [404]: ${fullPath}`);
        res.status(404).send('Beam Error: Deployment not found. Make sure slug is correct.');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Beam Proxy Engine is LIVE on http://localhost:${PORT}`);
});