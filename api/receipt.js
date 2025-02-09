const axios = require('axios');
const getRawBody = require('raw-body');
const FormData = require('form-data');

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const buffer = await getRawBody(req);
    const fileName = req.headers['x-file-name'] || 'receipt.jpg';
    const contentType = req.headers['content-type'];
    const authHeader = req.headers['authorization'];

    const form = new FormData();
    form.append('file', buffer, {
      filename: fileName,
      contentType: contentType,
    });

    const headers = {
      ...form.getHeaders(),
      ...(authHeader ? { 'Authorization': authHeader } : {})
    };

    const apiUrl = 'https://europe-west8-scriba-1.cloudfunctions.net/receipt';
    const response = await axios.post(apiUrl, form, { headers });

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