// src/modules/onboarding/onboarding.route.ts
import { Router } from 'express';
import upload from '../../middleware/fileUpload';
import { onboardingControllers } from './onboarding.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router();

// Admin upload
router.post(
  '/upload',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  upload.array('files', 3), // max 3 images
  onboardingControllers.uploadOnboardingImages
);

// App fetch
router.get('/', onboardingControllers.getOnboardingImages);

export const onboardingRoutes = router;
