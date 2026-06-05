import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { UpdateProfileSchema, CreateProfileSchema } from '@mockly/shared';
import { createProfile, getProfile, updateProfile } from '../controllers/auth.controller';

const router = Router();

router.post('/profile', authMiddleware, validate(CreateProfileSchema), createProfile);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validate(UpdateProfileSchema), updateProfile);
router.patch('/profile', authMiddleware, validate(UpdateProfileSchema), updateProfile);

export default router;
