const express = require('express');
const axios = require('axios');
const mime = require('mime-types');

const app = express();
const PORT = 8000;

const BASE_PATH = 'https://raxeapbmgaokvvivfymi.supabase.co/storage/v1/object/public/deployments/outputs';

app.use(async (req, res) => {
    const path = req.path;
    const parts = path.split('/').filter(x => x);
    
    // Simple logic: /shivani/index.html -> slug = shivani, file = index.html
    const slug = parts[0];
    const file = parts.slice(1).join('/') || 'index.html';

    if (!slug) return res.status(404).send("Project ID missing in URL");

    const target = `${BASE_PATH}/${slug}/${file}`;

    try {
        const response = await axios.get(target, { responseType: 'arraybuffer' });
        const contentType = mime.lookup(file) || 'text/html';
        res.set('Content-Type', contentType);
        return res.send(response.data);
    } catch (err) {
        console.error('❌ Error:', err.message);
        return res.status(404).send('File Not Found');
    }
});

app.listen(PORT, () => console.log(`🚀 Single Proxy Server LIVE on ${PORT}`));