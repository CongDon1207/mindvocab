import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import net from 'node:net';
import { connectDB } from './config/db.js';
import folderRoute from './routes/folderRoute.js';
import wordRoute from './routes/wordRoute.js';
import sessionRoute from './routes/sessionRoute.js';
import importJobRoute from './routes/importJobRoute.js';
import notebookEntryRoute from './routes/notebookEntryRoute.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/folders', folderRoute);
app.use('/api/words', wordRoute);
app.use('/api', sessionRoute);
app.use('/api/import-jobs', importJobRoute);
app.use('/api/notebook-entries', notebookEntryRoute);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
        return;
      }

      resolve(false);
    });

    tester.once('listening', () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port);
  });
}

async function isMindVocabRunning(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    if (!response.ok) return false;

    const payload = await response.json();
    return payload?.ok === true;
  } catch {
    return false;
  }
}

async function startServer() {
  const portAvailable = await isPortAvailable(PORT);

  if (!portAvailable) {
    const alreadyRunning = await isMindVocabRunning(PORT);

    if (alreadyRunning) {
      console.log(`MindVocab server is already running on port ${PORT}.`);
      process.exit(0);
    }

    console.error(`Port ${PORT} is already in use. Stop the process using this port or set another PORT in backend/.env.`);
    process.exit(1);
  }

  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the process using this port or set another PORT in backend/.env.`);
      process.exit(1);
      return;
    }

    console.error('Server startup error:', err.message);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('SQLite startup error:', err.message);
  process.exit(1);
});
