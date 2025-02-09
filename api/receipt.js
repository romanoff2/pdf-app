const axios = require('axios');

module.exports = async (req, res) => {
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
        const contentType = req.headers['content-type']; // Get from request
        const fileName = req.headers['x-file-name'] || 'receipt.jpg';

        // Get the raw body (already a Buffer)
        const buffer = Buffer.from(req.body);

        // Make the request directly with the buffer
        const response = await axios.post(apiUrl, buffer, {
            headers: {
                'Content-Type': contentType, // Use the received content type
                'X-File-Name': fileName,
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
                contentType: req.headers['content-type']
            }
        });
    }
};