const axios = require('axios');
const getRawBody = require('raw-body');
const FormData = require('form-data');

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  // Set CORS headers so your frontend can call this endpoint
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
    // Read the raw request body as a Buffer
    const buffer = await getRawBody(req);

    // Get the file name and content type from the headers.
    // (If not provided, default to 'resume.pdf')
    const fileName = req.headers['x-file-name'] || 'resume.pdf';
    const contentType = req.headers['content-type'];
    // If your remote API expects an Authorization header, pass it along.
    const authHeader = req.headers['authorization'];

    // Create a new FormData instance and append the file
    const form = new FormData();
    form.append('file', buffer, {
      filename: fileName,
      contentType: contentType,
    });

    // Build the headers object: include multipart headers from form-data,
    // and add Authorization if provided.
    const headers = {
      ...form.getHeaders(),
      ...(authHeader ? { 'Authorization': authHeader } : {})
    };

    // Send the request to the remote API.
    const apiUrl = 'https://europe-west8-scriba-1.cloudfunctions.net/cv';
    const response = await axios.post(apiUrl, form, { headers });

    // Return the remote API response to your frontend.
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