const axios = require('axios');
const FormData = require('form-data');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name, Authorization');

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

        // Create form data with proper boundary
        const form = new FormData();
        form.append('file', buffer, {
            filename: req.headers['x-file-name'] || 'document.pdf',
            contentType: 'application/pdf'
        });

        // Configure the request exactly like Postman
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://europe-west8-scriba-1.cloudfunctions.net/cv',
            headers: { 
                'Authorization': 'mMdcET13Xkk6AMblaDghJW0iKZIYU5TQohOyxI3bFBWFc1CBGzlReMd5z0KB379e',
                ...form.getHeaders()
            },
            data: form
        };

        // Make the request
        const response = await axios(config);

        // Send response back to client
        res.status(200).json(response.data);

    } catch (error) {
        console.error('Full error:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.response ? error.response.data : null,
            requestInfo: {
                fileName: req.headers['x-file-name'],
                contentType: req.headers['content-type']
            }
        });
    }
};