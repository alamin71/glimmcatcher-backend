import express from 'express';
import { adminControllers } from './admin.controller';
import auth from '../../../middleware/auth';

const router = express.Router();

// Admin login route (no auth needed)
router.post('/login', adminControllers.adminLogin);

// Protected admin route: only allow super_admin
router.get('/dashboard', auth('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Admin Dashboard',
    admin: req.user,
  });
});

export default router;
