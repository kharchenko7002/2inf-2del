import { Router } from 'express';
import multer from 'multer';
import * as readingsController from '../controllers/readings.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate);

router.get('/latest', readingsController.getLatest);
router.get('/history', readingsController.getHistory);
router.post('/upload', upload.single('file'), readingsController.uploadReadings);

export default router;
