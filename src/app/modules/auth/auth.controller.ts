// /* eslint-disable @typescript-eslint/ban-ts-comment */
// import { Request, Response } from 'express';
// import httpStatus from 'http-status';
// import config from '../../config';
// import catchAsync from '../../utils/catchAsync';
// import sendResponse from '../../utils/sendResponse';
// import { authServices } from './auth.service';
// const login = catchAsync(async (req: Request, res: Response) => {
//   const result = await authServices.login(req.body);
//   const { refreshToken } = result;
//   const cookieOptions = {
//     secure: false,
//     httpOnly: true,
//     // maxAge: parseInt(config.jwt.refresh_expires_in || '31536000000'),
//     maxAge: 31536000000,
//   };

//   if (config.NODE_ENV === 'production') {
//     //@ts-ignore
//     cookieOptions.sameSite = 'none';
//   }
//   res.cookie('refreshToken', refreshToken, cookieOptions);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Logged in successfully',
//     data: result,
//   });
// });
// const changePassword = catchAsync(async (req: Request, res: Response) => {
//   console.log('🔐 Change Password Called with userId:', req.user?.userId);
//   const result = await authServices.changePassword(req?.user?.userId, req.body);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'password changed successfully',
//     data: result,
//   });
// });
// const forgotPassword = catchAsync(async (req: Request, res: Response) => {
//   const result = await authServices.forgotPassword(req?.body?.email);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'An otp sent to your email!',
//     data: result,
//   });
// });

// const resetPassword = catchAsync(async (req: Request, res: Response) => {
//   console.log(req.body);
//   const result = await authServices.resetPassword(
//     req?.headers?.token as string,
//     req?.body,
//   );
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Password Reset successfully',
//     data: result,
//   });
// });
// const refreshToken = catchAsync(async (req, res) => {
//   const { refreshToken } = req.cookies;
//   console.log(refreshToken);
//   const result = await authServices.refreshToken(refreshToken);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Access token is retrieved successfully',
//     data: result,
//   });
// });
// export const authControllers = {
//   login,
//   changePassword,
//   forgotPassword,
//   resetPassword,
//   refreshToken,
// };
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../error/AppError';
import User from '../user/user.model';

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !user?.password) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    config.jwt_access_secret as Secret,
    { expiresIn: config.jwt_access_expires_in },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
    },
  });
});

// 1. Forgot Password already handled via `otp.controller.ts`

// 2. Reset Password - set new password after OTP verification
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { newPassword } = req.body;

  if (!token) throw new AppError(httpStatus.UNAUTHORIZED, 'Token missing');

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as Secret,
    ) as JwtPayload;
  } catch {
    throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
  }

  if (!decoded?.id || !decoded?.allowReset) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'OTP not verified or reset not allowed',
    );
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  user.password = newPassword; // raw password
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data: { user },
  });
});

// 3. Change Password - for logged-in users
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError(httpStatus.NOT_FOUND, 'User not found');

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch)
    throw new AppError(httpStatus.BAD_REQUEST, 'Old password is incorrect');

  // const hashedPassword = await bcrypt.hash(newPassword, 12);
  // user.password = hashedPassword;
  // await user.save();
  user.password = newPassword; // raw password
  await user.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: { user },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token is required');
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      config.jwt_refresh_secret as Secret,
    ) as JwtPayload;
    const token = jwt.sign(
      { id: decoded.id, role: decoded.role },
      config.jwt_access_secret as Secret,
      { expiresIn: config.jwt_access_expires_in },
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Access token refreshed',
      data: { token },
    });
  } catch {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Invalid or expired refresh token',
    );
  }
});

export const authControllers = {
  login,
  resetPassword,
  changePassword,
  refreshToken,
};
