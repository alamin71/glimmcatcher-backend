import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { otpServices } from './otp.service';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import { io } from '../../../server';
import { sendUserNotification, sendAdminNotification } from '../../../socketIo';

// 1. Signup initiate: send OTP & token (token is returned for OTP verification)
const signupInitiate = catchAsync(async (req: Request, res: Response) => {
  const result = await otpServices.initiateSignup(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent successfully. Please verify OTP to complete signup.',
    data: result,
  });
});

// 2. Signup OTP verify & create user
const signupVerifyOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.token as string;
  if (!token) {
    throw new Error('Token required in headers');
  }
  const { otp } = req.body;
  const result = await otpServices.verifySignupOtp(token, otp);
  // Send welcome notification to user
  sendUserNotification(io, result.user._id.toString(), {
    title: 'Welcome to Glimmcatcher',
    message: 'Your account has been created!',
    type: 'welcome',
  });

  // Notify admins
  sendAdminNotification(io, {
    title: 'New User Registered',
    message: `User ${result.user.email} has registered.`,
    type: 'user',
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully. User created.',
    data: result,
  });
});

// 3. Resend signup OTP
const resendSignupOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.token as string;
  if (!token) {
    throw new Error('Token required in headers');
  }
  const result = await otpServices.resendSignupOtp(token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP resent successfully. Please verify OTP.',
    data: result,
  });
});

// 4. Forgot password: send OTP + reset token
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await otpServices.initiateForgotPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent for password reset. Please verify OTP.',
    data: result,
  });
});

// 5. Forgot password OTP verify & allow reset token
const verifyForgotPasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.headers.token as string;
    if (!token) {
      throw new Error('Token required in headers');
    }
    const { otp } = req.body;
    const result = await otpServices.verifyForgotPasswordOtp(token, otp);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OTP verified. You can now reset your password.',
      data: result,
    });
  },
);

// 6. Resend forgot password OTP
const resendForgotPasswordOtp = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.headers.token as string;
    if (!token) {
      throw new Error('Token required in headers');
    }
    const result = await otpServices.resendForgotPasswordOtp(token);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'OTP resent successfully. Please verify OTP.',
      data: result,
    });
  },
);

export const otpControllers = {
  signupInitiate,
  signupVerifyOtp,
  resendSignupOtp,
  forgotPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
};
