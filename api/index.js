const axios = require('axios');
const FormData = require('form-data');

const EXTERNAL_ENDPOINTS = {
    'process-pdf': 'https://europe-west8-scriba-1.cloudfunctions.net/cv',
    'process-gas': 'https://n8n-sgsh.onrender.com/webhook/scriba/bolletta',
    'process-receipt': 'https://europe-west8-scriba-1.cloudfunctions.net/receipt'
};

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get the raw body from the request
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Get the path from the URL
        const path = req.url.split('/').pop();
        const endpoint = EXTERNAL_ENDPOINTS[path];
        
        if (!endpoint) {
            return res.status(404).json({ error: 'Endpoint not found' });
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', buffer, {
            filename: req.headers['x-file-name'] || 'document.pdf',
            contentType: req.headers['content-type']
        });

        console.log('Sending request to:', endpoint);

        // Make request to external API
        const apiResponse = await axios.post(endpoint, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': 'mMdcET13Xkk6AMblaDghJW0iKZIYU5TQohOyxI3bFBWFc1CBGzlReMd5z0KB379e'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        // Ensure we're sending JSON response
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(apiResponse.data);

    } catch (error) {
        console.error('Error details:', error);
        
        // Ensure we're sending JSON response
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ 
            error: error.message,
            details: error.response ? error.response.data : null,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};