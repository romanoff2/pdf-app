const axios = require('axios');
const FormData = require('form-data');

module.exports = async (req, res) => {
    // CORS Headers
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
        const apiUrl = 'https://europe-west8-scriba-1.cloudfunctions.net/receipt';

        // Get the raw body
        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        const fileName = req.headers['x-file-name'] || 'receipt.jpg'; // Default name
        const ext = fileName.split('.').pop().toLowerCase();
        const contentType = `image/${ext}`; // Determine content type


        // Create form data
        const form = new FormData();
        form.append('file', buffer, {
            filename: fileName,
            contentType: contentType
        });

        // Make the request (simplified)
        const response = await axios.post(apiUrl, form, {
            headers: {
                ...form.getHeaders(),
            }
        });

        res.status(200).json(response.data);

    } catch (error) {
        console.error('Full error:', error);
        res.status(500).json({
            error: error.message,
            details: error.response ? error.response.data : null,
            requestInfo: {
                fileName: req.headers['x-file-name'],
                contentType: req.headers['content-type'] // Corrected
            }
        });
    }
};