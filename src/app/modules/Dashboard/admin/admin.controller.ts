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

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const otp = await adminService.setForgotOtp(req.body.email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP sent successfully',
    data: { otp },
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  await adminService.verifyOtp(req.body.email, req.body.otp);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'OTP verified',
    data: {},
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await adminService.resetPassword(req.body.email, req.body.newPassword);
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
