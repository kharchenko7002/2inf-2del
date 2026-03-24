// c:\projects\kostian_task\backend\src\routes\readings.routes.ts

import { Router } from 'express';
import * as readingsController from '../controllers/readings.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/latest', readingsController.getLatest);
router.get('/history', readingsController.getHistory);

export default router;
