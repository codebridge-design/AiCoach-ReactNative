import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { llmRateLimit } from '../middleware/rateLimiter';
import { NextQuestionSchema, FollowUpQuestionSchema, QuestionBankQuerySchema } from '@mockly/shared';
import { nextQuestion, followUpQuestion, getQuestionBank, saveToBank } from '../controllers/questions.controller';

const router = Router();

router.post('/next', authMiddleware, llmRateLimit, validate(NextQuestionSchema), nextQuestion);
router.post('/followup', authMiddleware, llmRateLimit, validate(FollowUpQuestionSchema), followUpQuestion);
router.get('/bank', authMiddleware, validate(QuestionBankQuerySchema, 'query'), getQuestionBank);
router.patch('/:id/save-to-bank', authMiddleware, saveToBank);

export default router;
