import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import express from 'express';
import cors from 'cors';

// In-memory storage for emails
const emailStore = new Map();

// Create Express app for API endpoints
const app = express();
app.use(cors());
app.use(express.json());

// API endpoint to get emails for an address
app.get('/api/emails/:address', (req, res) => {
  const { address } = req.params;
  const emails = emailStore.get(address) || [];
  res.json(emails);
});

// Create SMTP server
const smtpServer = new SMTPServer({
  secure: false,
  disabledCommands: ['STARTTLS', 'AUTH'],
  onData(stream, session, callback) {
    let buffer = '';
    stream.on('data', (chunk) => {
      buffer += chunk;
    });

    stream.on('end', async () => {
      try {
        // Parse email
        const parsed = await simpleParser(buffer);
        const to = parsed.to.text;
        
        // Store email
        const email = {
          id: Date.now().toString(),
          from: parsed.from.text,
          subject: parsed.subject,
          body: parsed.html || parsed.text,
          receivedAt: new Date().toISOString()
        };

        // Add to store
        const existing = emailStore.get(to) || [];
        emailStore.set(to, [email, ...existing]);

        callback();
      } catch (err) {
        console.error('Error processing email:', err);
        callback(new Error('Error processing email'));
      }
    });
  }
});

// Start servers
const SMTP_PORT = process.env.SMTP_PORT || 2525;
const API_PORT = process.env.PORT || 3000;

smtpServer.listen(SMTP_PORT, () => {
  console.log(`SMTP Server running on port ${SMTP_PORT}`);
});

app.listen(API_PORT, () => {
  console.log(`API Server running on port ${API_PORT}`);
});