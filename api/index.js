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

    const axios = require('axios');
    const FormData = require('form-data');
    
    module.exports = async (req, res) => {
        // ... existing code ...
    
        try {
            const endpoint = req.url.split('/').pop(); // This will get 'resume' or 'receipt'
            const apiEndpoints = {
                resume: {
                    url: 'https://europe-west8-scriba-1.cloudfunctions.net/cv',
                    contentType: 'application/pdf'
                },
                receipt: {
                    url: 'https://europe-west8-scriba-1.cloudfunctions.net/receipt',
                    contentType: 'image/jpeg' // or will be determined from file extension
                }
            };
    
            if (!apiEndpoints[endpoint]) {
                return res.status(404).json({ error: 'Invalid endpoint' });
            }
    
            // Get the raw body from the request
            const chunks = [];
            for await (const chunk of req) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
    
            // Determine content type based on file extension for receipt endpoint
            const fileName = req.headers['x-file-name'] || 'document';
            let contentType = apiEndpoints[endpoint].contentType;
            if (endpoint === 'receipt') {
                const ext = fileName.split('.').pop().toLowerCase();
                contentType = `image/${ext}`;
            }
    
            // Create form data with proper boundary
            const form = new FormData();
            form.append('file', buffer, {
                filename: fileName,
                contentType: contentType
            });
    
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: apiEndpoints[endpoint].url,
            headers: { 
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