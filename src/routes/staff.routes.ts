import staffController from '@/controllers/staff.controller';
import express from 'express';

const router = express.Router();

router.post('/sync', staffController.syncFromSheet);

export default router;
