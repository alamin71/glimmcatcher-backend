import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { USER_ROLE } from './user.constant';
import { userServices } from './user.service';
import { UserRole } from './user.interface';

// create employee

const signupuser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.signupuser({
    ...req.body,
    role: UserRole.user,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'signup succesfully',
    data: result,
  });
});
const getme = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getme(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'user retrived successfully',
    data: result,
  });
});
const updatePhoneNumber = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.updatePhoneNumber(
    req.user.userId,
    req.body,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'user updated successfully',
    data: result,
  });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  let image;
  if (req?.file) {
    image = await uploadToS3(req?.file, 'profile/');
  }

  const result = await userServices.updateProfile(req.user.userId, {
    ...req.body,
    image,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'user profile updated successfully',
    data: result,
  });
});

const getsingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrived successfully',
    data: result,
  });
});
// const getAllUsers = catchAsync(async (req: Request, res: Response) => {
//   const result = await userServices.getAllUsers();
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'All users retrieved successfully',
//     data: result,
//   });
// });

const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body, 'DD');
  const result = await userServices.deleteAccount(
    req?.user?.userId,
    req?.body?.password,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const userControllers = {
  getme,
  signupuser,
  updateProfile,
  getsingleUser,
  // getAllUsers,
  deleteAccount,
  updatePhoneNumber,
};
