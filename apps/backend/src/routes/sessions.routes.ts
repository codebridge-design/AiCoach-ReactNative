import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { CreateSessionSchema, EndSessionSchema } from '@mockly/shared';
import { createSession, listSessions, getSession, endSession, deleteSession } from '../controllers/sessions.controller';

const router = Router();

router.post('/', authMiddleware, validate(CreateSessionSchema), createSession);
router.get('/', authMiddleware, listSessions);
router.get('/:id', authMiddleware, getSession);
router.patch('/:id/end', authMiddleware, validate(EndSessionSchema), endSession);
router.delete('/:id', authMiddleware, deleteSession);

export default router;
