// import express from 'express';
// import { adminControllers } from './admin.controller';
// import auth from '../../../middleware/auth';

// const router = express.Router();

// // Admin login route (no auth needed)
// router.post('/login', adminControllers.adminLogin);

// // Protected admin route: only allow super_admin
// router.get('/dashboard', auth('admin', 'super_admin'), (req, res) => {
//   res.json({
//     success: true,
//     message: 'Welcome to Admin Dashboard',
//     admin: req.user,
//   });
// });

// export default router;

import { Router } from 'express';
import auth from '../../../middleware/auth';
import { adminControllers } from './admin.controller';
import upload from '../../../middleware/fileUpload';

const router = Router();

router.post('/login', adminControllers.adminLogin);

router.patch(
  '/update-profile',
  auth('admin', 'super_admin'),
  upload.single('file'),
  adminControllers.updateProfile,
);
router.patch(
  '/change-password',
  auth('admin', 'super_admin'),
  adminControllers.changePassword,
);
router.post('/forgot-password', adminControllers.forgotPassword);
router.post('/verify-otp', adminControllers.verifyOtp);
router.post('/reset-password', adminControllers.resetPassword);

export const adminRoutes = router;
