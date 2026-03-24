// c:\projects\kostian_task\backend\src\routes\faq.routes.ts

import { Router } from 'express';
import * as faqController from '../controllers/faq.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', faqController.getAll);
router.get('/:id', faqController.getById);

export default router;
