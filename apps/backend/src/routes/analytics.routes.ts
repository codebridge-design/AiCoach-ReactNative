import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getSummary, getHistory, getWeakTopics, getProgress } from '../controllers/analytics.controller';

const router = Router();

router.get('/summary', authMiddleware, getSummary);
router.get('/history', authMiddleware, getHistory);
router.get('/weak-topics', authMiddleware, getWeakTopics);
router.get('/progress', authMiddleware, getProgress);

export default router;
