// routes/sessionRoute.js
import express from 'express';
import {
  createSession,
  createNextSession,
  getSession,
  updateSession
} from '../controllers/sessionController.js';
import { createAttempt, getSessionAttempts } from '../controllers/attemptController.js';
import { completeSession } from '../controllers/sessionCompletionController.js';

const router = express.Router();

// Session routes
router.post('/sessions', createSession);
router.post('/sessions/next', createNextSession);
router.get('/sessions/:id', getSession);
router.put('/sessions/:id', updateSession);
router.post('/sessions/:id/complete', completeSession);

// Attempt routes
router.post('/attempts', createAttempt);
router.get('/sessions/:id/attempts', getSessionAttempts);

export default router;
