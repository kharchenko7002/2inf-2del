// c:\projects\kostian_task\backend\src\routes\user.routes.ts

import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/theme', userController.updateTheme);

export default router;
