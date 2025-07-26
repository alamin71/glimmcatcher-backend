import express from 'express';
import { getNotifications } from '../notification/notification.controller';

const router = express.Router();

router.get('/notifications', getNotifications);

export default router;
