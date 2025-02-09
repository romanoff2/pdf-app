const express = require('express');
const multer = require('multer');
const axios = require('axios');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const API_KEY = process.env.API_KEY;

const EXTERNAL_ENDPOINTS = {
    'process-pdf': 'https://europe-west8-scriba-1.cloudfunctions.net/cv',
    'process-gas': 'https://n8n-sgsh.onrender.com/webhook/scriba/bolletta',
    'process-receipt': 'https://europe-west8-scriba-1.cloudfunctions.net/receipt'
};

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const path = req.url.split('/').pop();
            const endpoint = EXTERNAL_ENDPOINTS[path];
            
            if (!endpoint) {
                return res.status(404).json({ error: 'Endpoint not found' });
            }

            // Create form data
            const formData = new FormData();
            formData.append('file', req.body);

            // Make request to external API
            const apiResponse = await axios.post(endpoint, formData, {
                headers: {
                    'Authorization': API_KEY,
                    'Content-Type': 'application/pdf'
                }
            });

            res.status(200).json(apiResponse.data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};