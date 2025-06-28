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
import { Request, Response } from 'express';
import catchAsync from '../../../utils/catchAsync';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import { Admin } from '../admin/admin.model';
import config from '../../../config';
import AppError from '../../../error/AppError';
import sendResponse from '../../../utils/sendResponse';

const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) throw new AppError(httpStatus.NOT_FOUND, 'Admin not found');

  const isMatch = await admin.isPasswordMatched(password);
  if (!isMatch)
    throw new AppError(httpStatus.UNAUTHORIZED, 'Incorrect password');

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    config.jwt_access_secret as string,
    { expiresIn: config.jwt_access_expires_in },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
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

export const adminControllers = {
  adminLogin,
};
