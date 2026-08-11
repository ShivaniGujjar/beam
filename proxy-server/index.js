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

    if (hostname.includes('.localhost') || hostname.includes('.onrender.com')) {
        const hostParts = hostname.split('.');
        if (hostParts.length >= 3 && hostParts[0] !== 'proxy-server-beam') {
            slug = hostParts[0];
            file = parts.join('/') || 'index.html';
        }
    }

    if (!slug) {
        slug = parts[0];
        file = parts.slice(1).join('/') || 'index.html';
    }

    if (!slug) return res.status(404).send("Project ID missing in request");

    const tryFetch = async (targetUrl) => {
        try {
            return await axios.get(targetUrl, { responseType: 'stream' });
        } catch (e) {
            return null;
        }
    };

    // Candidate 1: Standard Direct
    let targetUrl = `${BASE_PATH}/${slug}/${file}`;
    let response = await tryFetch(targetUrl);

    // Candidate 2: Nested Subfolder (e.g. outputs/final/akina/index.html or outputs/final/dist/index.html)
    if (!response) {
        // If file is just index.html or empty, try searching inside first inner folder
        // Target common subfolders
        const subfolders = ['akina', 'dist', 'build', slug];
        for (const sub of subfolders) {
            const nestedUrl = `${BASE_PATH}/${slug}/${sub}/${file}`;
            response = await tryFetch(nestedUrl);
            if (response) break;
        }
    }

    if (response) {
        const contentType = mime.lookup(file) || 'text/html';
        res.set('Content-Type', contentType);
        return response.data.pipe(res);
    }

    return res.status(404).send(`404: Could not find ${file} for deployment '${slug}'`);
});

app.listen(PORT, () => console.log(`🚀 Proxy Server LIVE on ${PORT}`));