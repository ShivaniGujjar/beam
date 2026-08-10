const express = require('express');
const axios = require('axios');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 8000;

const BASE_PATH = 'https://raxeapbmgaokvvivfymi.supabase.co/storage/v1/object/public/deployments/outputs';

app.use(async (req, res) => {
    const hostname = req.hostname;
    const path = req.path;
    const parts = path.split('/').filter(Boolean);

    let slug = '';
    let file = '';

    // 1. Subdomain resolution support (e.g. shivani.localhost)
    if (hostname.includes('.localhost')) {
        slug = hostname.split('.')[0];
        file = parts.join('/') || 'index.html';
    } else {
        // 2. Path-based resolution support (e.g. localhost:8000/shivani/index.html)
        slug = parts[0];
        file = parts.slice(1).join('/') || 'index.html';
    }

    if (!slug) return res.status(404).send("Project ID missing in request");

    // Clean up trailing slash or asset lookup
    const targetUrl = `${BASE_PATH}/${slug}/${file}`;

    try {
        const response = await axios.get(targetUrl, { responseType: 'stream' });
        const contentType = mime.lookup(file) || 'text/html';
        
        res.set('Content-Type', contentType);
        return response.data.pipe(res);
    } catch (err) {
        // 3. SPA Fallback Logic: If asset missing, fallback to index.html for client-side routing
        if (!file.includes('.')) {
            try {
                const fallbackUrl = `${BASE_PATH}/${slug}/index.html`;
                const fallbackResponse = await axios.get(fallbackUrl, { responseType: 'stream' });
                res.set('Content-Type', 'text/html');
                return fallbackResponse.data.pipe(res);
            } catch (fallbackErr) {
                return res.status(404).send('SPA Entry point (index.html) not found.');
            }
        }
        console.error(`❌ Proxy Fetch Error [${slug}/${file}]:`, err.message);
        return res.status(404).send('File Not Found');
    }
});

app.listen(PORT, () => console.log(`🚀 Single Proxy Server LIVE on ${PORT}`));