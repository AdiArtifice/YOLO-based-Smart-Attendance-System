// server.js (ESM)
// Load environment variables from .env if present (do this before other imports use process.env)
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors());
// Increase limit if images are larger (adjust as needed)
app.use(express.json({ limit: '15mb' })); // to parse JSON body (including images)

// Roboflow inference configuration (can be overridden by environment vars)
const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY || 'REPLACE_ME_API_KEY';
const WORKFLOW_URL = process.env.WORKFLOW_URL || 'http://localhost:9001';
const WORKFLOW_NAME = process.env.WORKFLOW_NAME || 'detect-and-classify';

// Helper: build workflow endpoint
const workflowEndpoint = `${WORKFLOW_URL.replace(/\/$/, '')}/workflow/${WORKFLOW_NAME}`;

/*
 * To run Roboflow Inference locally (example with Docker):
 *
 *  docker run --rm -it \\
 *    -e ROBOFLOW_API_KEY=YOUR_KEY_HERE \\
 *    -e WORKFLOW_URL=https://serverless.roboflow.com \\
 *    -e WORKFLOW_NAME=detect-and-classify \\
 *    -p 9001:9001 \\
 *    roboflow/inference:latest
 *
 * If using a local container exposing port 9001, set WORKFLOW_URL=http://localhost:9001.
 */

app.post('/detect', async (req, res) => {
  const { image } = req.body || {};
  if (!image) {
    return res.status(400).json({ error: 'Missing image (base64) in request body' });
  }

  try {
    // Forward to Roboflow workflow inference endpoint
    const response = await axios.post(
      workflowEndpoint,
      { image },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ROBOFLOW_API_KEY}`,
        },
        timeout: 20000, // 20s timeout – adjust if models are slower
      }
    );

    // Return data as-is so frontend logic need not change
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const details = error.response?.data || { message: error.message };
    console.error('[Inference Error]', {
      workflowEndpoint,
      status,
      details,
    });
    res.status(500).json({ error: 'Inference failed', details });
  }
});

app.post('/save-attendance', (req, res) => {
  const attendance = req.body;

  fs.writeFile('attendance.json', JSON.stringify(attendance, null, 2), (err) => {
    if (err) {
      console.error('Error saving attendance:', err);
      return res.status(500).json({ message: 'Failed to save attendance' });
    }
    res.json({ message: 'Attendance saved successfully!' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Roboflow workflow endpoint:', workflowEndpoint);
});

// NOTE: If you decide to use the Flask backend instead, implement a similar proxy route there:
// @app.route('/detect', methods=['POST']) -> extract base64 image -> requests.post to workflowEndpoint with headers {Authorization: Bearer <API_KEY>} -> return JSON.
