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

    // 1. Dynamic Subdomain Resolution (.localhost OR .onrender.com OR custom domain)
    if (hostname.includes('.localhost') || hostname.includes('.onrender.com')) {
        const hostParts = hostname.split('.');
        // Extract first part as slug if it's a subdomain request (e.g. qwerty.beam-proxy.onrender.com)
        if (hostParts.length >= 3) {
            slug = hostParts[0];
            file = parts.join('/') || 'index.html';
        }
    }

    // 2. Fallback to Path-based Resolution (e.g. beam-proxy.onrender.com/qwerty/index.html)
    if (!slug) {
        slug = parts[0];
        file = parts.slice(1).join('/') || 'index.html';
    }

    if (!slug) return res.status(404).send("Project ID missing in request");

    const targetUrl = `${BASE_PATH}/${slug}/${file}`;

    try {
        const response = await axios.get(targetUrl, { responseType: 'stream' });
        const contentType = mime.lookup(file) || 'text/html';
        
        res.set('Content-Type', contentType);
        return response.data.pipe(res);
    } catch (err) {
        // 3. SPA Fallback Logic
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