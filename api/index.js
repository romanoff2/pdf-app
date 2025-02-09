const express = require('express');
const multer = require('multer');
const axios = require('axios');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// This is important for Vercel
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            // Replace with your actual API endpoint and key
            const API_ENDPOINT = process.env.API_ENDPOINT;
            const API_KEY = process.env.API_KEY;

            // Create form data
            const formData = new FormData();
            formData.append('file', req.body);

            // Make request to external API
            const apiResponse = await axios.post(API_ENDPOINT, formData, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
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