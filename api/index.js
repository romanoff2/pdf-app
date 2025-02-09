const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const upload = multer({ storage: multer.memoryStorage() });

const EXTERNAL_ENDPOINTS = {
    'process-pdf': 'https://europe-west8-scriba-1.cloudfunctions.net/cv',
    'process-gas': 'https://n8n-sgsh.onrender.com/webhook/scriba/bolletta',
    'process-receipt': 'https://europe-west8-scriba-1.cloudfunctions.net/receipt'
};

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            // Get the path from the URL
            const path = req.url.split('/').pop();
            const endpoint = EXTERNAL_ENDPOINTS[path];
            
            if (!endpoint) {
                return res.status(404).json({ error: 'Endpoint not found' });
            }

            // Create a new FormData instance
            const formData = new FormData();
            
            // Get the file buffer and filename from the request
            const fileBuffer = req.body;
            const fileName = req.headers['x-file-name'] || 'document.pdf';

            // Append the file to the FormData
            formData.append('file', fileBuffer, {
                filename: fileName,
                contentType: 'application/pdf'
            });

            // Make request to external API
            const apiResponse = await axios.post(endpoint, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': 'mMdcET13Xkk6AMblaDghJW0iKZIYU5TQohOyxI3bFBWFc1CBGzlReMd5z0KB379e'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            res.status(200).json(apiResponse.data);
        } catch (error) {
            console.error('Error details:', error);
            res.status(500).json({ 
                error: error.message,
                details: error.response ? error.response.data : null
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};