const axios = require('axios');
const getRawBody = require('raw-body');

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

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
    // Manually read the raw body from the request stream.
    const buffer = await getRawBody(req);
    const apiUrl = 'https://europe-west8-scriba-1.cloudfunctions.net/cv';
    const contentType = req.headers['content-type'];
    const fileName = req.headers['x-file-name'] || 'resume.pdf';

    // Forward the raw binary file to the remote API.
    const response = await axios.post(apiUrl, buffer, {
      headers: {
        'Content-Type': contentType,
        'X-File-Name': fileName,
      },
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