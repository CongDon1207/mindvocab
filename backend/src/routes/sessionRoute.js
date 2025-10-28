// routes/sessionRoute.js
import express from 'express';
import {
  createSession,
  getSession,
  updateSession,
  createAttempt,
  getSessionAttempts,
  completeSession
} from '../controllers/sessionController.js';

const router = express.Router();

// Session routes
router.post('/sessions', createSession);
router.get('/sessions/:id', getSession);
router.put('/sessions/:id', updateSession);
router.post('/sessions/:id/complete', completeSession);

// Attempt routes
router.post('/attempts', createAttempt);
router.get('/sessions/:id/attempts', getSessionAttempts);

export default router;
