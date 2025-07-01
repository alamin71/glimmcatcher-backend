// // src/app/modules/Dashboard/admin/admin.controller.ts
// import { Request, Response } from 'express';
// import catchAsync from '../../../utils/catchAsync';
// import httpStatus from 'http-status';
// import jwt from 'jsonwebtoken';
// import { Admin } from '../admin/admin.model';
// import config from '../../../config';
// import AppError from '../../../error/AppError';
// import sendResponse from '../../../utils/sendResponse';

// const adminLogin = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   const admin = await Admin.findOne({ email }).select('+password');
//   if (!admin) throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');

//   const isMatch = await admin.isPasswordMatched(password);
//   if (!isMatch)
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password');

//   const token = jwt.sign(
//     { id: admin._id, role: admin.role },
//     config.jwt_access_secret as string,
//     { expiresIn: config.jwt_access_expires_in },
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Admin login successful',
//     data: {
//       admin,
//       token,
//     },
//   });
// });

// export const adminControllers = {
//   adminLogin,
// };
// src/app/modules/Dashboard/admin/admin.controller.ts
// import { Request, Response } from 'express';
// import catchAsync from '../../../utils/catchAsync';
// import httpStatus from 'http-status';
// import jwt from 'jsonwebtoken';
// import { Admin } from '../admin/admin.model';
// import config from '../../../config';
// import AppError from '../../../error/AppError';
// import sendResponse from '../../../utils/sendResponse';

// const adminLogin = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   const admin = await Admin.findOne({ email }).select('+password');
//   if (!admin) throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');

//   const isMatch = await admin.isPasswordMatched(password);
//   if (!isMatch)
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password');

//   const token = jwt.sign(
//     { id: admin._id, role: admin.role },
//     config.jwt_access_secret as string,
//     { expiresIn: config.jwt_access_expires_in },
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Admin login successful',
//     data: {
//       admin: {
//         id: admin._id,
//         email: admin.email,
//         role: admin.role,
//       },
//       token,
//     },
//   });
// });

// export const adminControllers = {
//   adminLogin,
// };
// ✅ admin.controller.ts

import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import httpStatus from 'http-status';
import { Admin } from './admin.model';
import jwt from 'jsonwebtoken';
import config from '../../../config';
import { adminService } from './admin.service';
import AppError from '../../../error/AppError';
import { uploadToS3 } from '../../../utils/fileHelper';

const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');

  const isMatch = await admin.isPasswordMatched(password);
  if (!isMatch)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password');

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    config.jwt_access_secret!,
    {
      expiresIn: config.jwt_access_expires_in,
    },
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admin login successful',
    data: {
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      token,
    },
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  let image;
  if (req.file) {
    image = await uploadToS3(req.file, 'admin-profile/');
  }

  const result = await adminService.updateAdminProfile(req.user.id, {
    ...req.body,
    ...(image && { image }),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  await adminService.changePassword(
    req.user.id,
    req.body.oldPassword,
    req.body.newPassword,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully',
    data: {},
  });
});

// const forgotPassword = catchAsync(async (req: Request, res: Response) => {
//   const otp = await adminService.setForgotOtp(req.body.email);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'OTP sent successfully , please verify otp before reset password',
//     data: { otp },
//   });
// });

// const verifyOtp = catchAsync(async (req: Request, res: Response) => {
//   await adminService.verifyOtp(req.body.email, req.body.otp);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'OTP verified , now you can reset password',
//     data: {},
//   });
// });

// const resetPassword = catchAsync(async (req: Request, res: Response) => {
//   await adminService.resetPassword(req.body.email, req.body.newPassword);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Password reset successful',
//     data: {},
//   });
// });
// Store verified email temporarily in memory or use Redis/cache in real project
const verifiedAdmins = new Map<string, string>();

// global in-memory Map (for demo only)
const otpStore = new Map<string, string>();

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const otp = await adminService.setForgotOtp(req.body.email);
  otpStore.set(otp.toString(), req.body.email); // ✅ store otp → email
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP sent successfully, please verify before reset password',
    data: { otp }, // ❌ remove this in production
  });
});

// const verifyOtp = catchAsync(async (req: Request, res: Response) => {
//   const { otp } = req.body;

//   // Match OTP against all temporary entries (demo approach)
//   const matchedEmail = [...verifiedAdmins.entries()].find(
//     ([email, storedOtp]) => storedOtp === otp.toString(),
//   )?.[0];

//   if (!matchedEmail) throw new AppError(400, 'OTP mismatch or expired');

//   await adminService.verifyOtp(matchedEmail, otp);
//   verifiedAdmins.set(matchedEmail, 'VERIFIED');

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'OTP verified, now you can reset password',
//     data: {},
//   });
// });
const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { otp } = req.body;

  const email = otpStore.get(otp.toString());
  if (!email) {
    throw new AppError(400, 'OTP mismatch or expired');
  }

  await adminService.verifyOtp(email, otp);
  otpStore.delete(otp.toString()); // optional cleanup

  const token = jwt.sign({ email }, config.jwt_access_secret as string, {
    expiresIn: '15m',
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP verified. Use this token to reset password.',
    data: { token },
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword)
    throw new AppError(400, 'Passwords do not match');

  // Find verified email
  const matchedEmail = [...verifiedAdmins.entries()].find(
    ([email, status]) => status === 'VERIFIED',
  )?.[0];

  if (!matchedEmail) throw new AppError(400, 'OTP not verified');

  await adminService.resetPassword(matchedEmail, newPassword);
  verifiedAdmins.delete(matchedEmail); // Clean up

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password reset successful',
    data: {},
  });
});

export const adminControllers = {
  adminLogin,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
