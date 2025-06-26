// import { Router } from 'express';
// import { otpControllers } from './otp.controller';
// const router = Router();

// router.post('/verify-otp', otpControllers.verifyOtp);
// router.post('/resend-otp', otpControllers.resendOtp);

// export const otpRoutes = router;
import { Router } from 'express';
import { otpControllers } from './otp.controller';
import validateRequest from '../../middleware/validateRequest';
import { otpValidation } from '../otp/otp.validation';

const router = Router();

// 📌 User Signup OTP Flow
router.post(
  '/signup-initiate',
  validateRequest(otpValidation.signupInitiateSchema),
  otpControllers.signupInitiate,
);

router.post(
  '/signup-verify',
  validateRequest(otpValidation.verifyOtpSchema),
  otpControllers.signupVerifyOtp,
);

router.post('/signup-resend', otpControllers.resendSignupOtp);

// 📌 Forgot Password OTP Flow
router.post(
  '/forgot-password',
  validateRequest(otpValidation.forgotPasswordSchema),
  otpControllers.forgotPassword,
);

router.post(
  '/forgot-password/verify',
  validateRequest(otpValidation.verifyOtpSchema),
  otpControllers.verifyForgotPasswordOtp,
);

router.post('/forgot-password/resend', otpControllers.resendForgotPasswordOtp);

export const otpRoutes = router;
