// server.js (ESM)
import express from 'express';
import fs from 'node:fs';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // to parse JSON body (including images)

app.post('/detect', (req, res) => {
  // Your detection logic here (fake detection example)
  // Just echoing back a sample detection for testing

  const sampleDetections = [
    { id: 'user1', name: 'Alice' },
    { id: 'user2', name: 'Bob' },
  ];
  res.json({ detections: sampleDetections });
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

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
