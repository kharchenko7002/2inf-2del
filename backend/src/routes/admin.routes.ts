// c:\projects\kostian_task\backend\src\routes\admin.routes.ts

import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

// FAQ routes
router.post('/faq', adminController.createFAQ);
router.patch('/faq/:id', adminController.updateFAQ);
router.delete('/faq/:id', adminController.deleteFAQ);

// User routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/role', adminController.updateUserRole);

export default router;
