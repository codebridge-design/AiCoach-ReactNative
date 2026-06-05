import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { llmRateLimit } from '../middleware/rateLimiter';
import { SubmitAnswerSchema, EditAnswerSchema } from '@mockly/shared';
import { submitAnswer, submitVoiceAnswer, editAnswer, skipAnswer } from '../controllers/answers.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const router = Router();

router.post('/', authMiddleware, llmRateLimit, validate(SubmitAnswerSchema), submitAnswer);
router.post('/voice', authMiddleware, llmRateLimit, upload.single('audio'), submitVoiceAnswer);
router.put('/:id', authMiddleware, validate(EditAnswerSchema), editAnswer);
router.post('/:id/skip', authMiddleware, skipAnswer);

export default router;
