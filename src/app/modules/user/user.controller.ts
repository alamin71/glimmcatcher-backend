// import { Request, Response } from 'express';
// import catchAsync from '../../utils/catchAsync';
// import { uploadToS3 } from '../../utils/fileHelper';
// import sendResponse from '../../utils/sendResponse';
// import { USER_ROLE } from './user.constant';
// import { userServices } from './user.service';
// import { UserRole } from './user.interface';

// // create employee

// // const signupuser = catchAsync(async (req: Request, res: Response) => {
// //   const result = await userServices.signupuser({
// //     ...req.body,
// //     role: UserRole.user,
// //   });
// //   sendResponse(res, {
// //     statusCode: 200,
// //     success: true,
// //     message: 'signup succesfully',
// //     data: result,
// //   });
// // });
// const getme = catchAsync(async (req: Request, res: Response) => {
//   const result = await userServices.getme(req.user.userId);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'user retrived successfully',
//     data: result,
//   });
// });
// const updatePhoneNumber = catchAsync(async (req: Request, res: Response) => {
//   const result = await userServices.updatePhoneNumber(
//     req.user.userId,
//     req.body,
//   );
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'user updated successfully',
//     data: result,
//   });
// });

// const updateProfile = catchAsync(async (req: Request, res: Response) => {
//   let image;
//   if (req?.file) {
//     image = await uploadToS3(req?.file, 'profile/');
//   }

//   const result = await userServices.updateProfile(req.user.userId, {
//     ...req.body,
//     image,
//   });
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'user profile updated successfully',
//     data: result,
//   });
// });

// const getsingleUser = catchAsync(async (req: Request, res: Response) => {
//   const result = await userServices.getSingleUser(req.params.id);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User retrived successfully',
//     data: result,
//   });
// });
// const getAllUsers = catchAsync(async (req: Request, res: Response) => {
//   const result = await userServices.getAllUsers();
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'All users retrieved successfully',
//     data: result,
//   });
// });

// const deleteAccount = catchAsync(async (req: Request, res: Response) => {
//   console.log(req.body, 'DD');
//   const result = await userServices.deleteAccount(
//     req?.user?.userId,
//     req?.body?.password,
//   );
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User deleted successfully',
//     data: result,
//   });
// });

// export const userControllers = {
//   getme,
//   updateProfile,
//   getsingleUser,
//   getAllUsers,
//   deleteAccount,
//   updatePhoneNumber,
// };

import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { userServices } from './user.service';
import { io } from '../../../server';
import { sendUserNotification } from '../../../socketIo';

// Get current user's profile
const getme = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getme(req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

// Update user phone number (only phoneNumber & countryCode allowed)
const updatePhoneNumber = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.updatePhoneNumber(req.user.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Phone number updated successfully',
    data: result,
  });
});

// // Update user profile (image upload + name, etc.)
// const updateProfile = catchAsync(async (req: Request, res: Response) => {
//   let image;
//   if (req.file) {
//     image = await uploadToS3(req.file, 'profile/');
//   }

//   const result = await userServices.updateProfile(req.user.id, {
//     ...req.body,
//     ...(image && { image }),
//   });

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Profile updated successfully',
//     data: result,
//   });
// });
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  let image;

  // Upload image if provided
  if (req.file) {
    image = await uploadToS3(req.file, 'profile/');
  }

  // Determine which user's profile is being updated
  const isAdmin = req.user.role === 'admin' || req.user.role === 'sup_admin';
  const userIdToUpdate = isAdmin && req.params.id ? req.params.id : req.user.id;

  // If admin is updating their own profile, make gender optional
  const isAdminUpdatingSelf = isAdmin && userIdToUpdate === req.user.id;

  // Build update data
  const updateData: Record<string, any> = {
    ...req.body,
    ...(image && { image }),
  };

  // Remove gender if admin is updating their own profile and gender is missing
  if (isAdminUpdatingSelf && !req.body.gender) {
    delete updateData.gender;
  }

  // Call the service to update
  const result = await userServices.updateProfile(userIdToUpdate, updateData);
  // Send notification to user
  sendUserNotification(io, userIdToUpdate, {
    title: 'Profile Updated',
    message: 'Your profile has been updated successfully.',
    type: 'profile',
  });
  // Respond with updated user info and context
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profile updated successfully',
    data: {
      updatedUser: result,
      updatedBy: {
        id: req.user.id,
        role: req.user.role,
        actingOn: userIdToUpdate,
      },
    },
  });
});

// Get single user (used by admin)
const getsingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getSingleUser(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

// Get all users (used by admin)
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Delete own account (soft delete)
const deleteAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.deleteAccount(
    req.user.id,
    req.body.password,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User account deleted successfully',
    data: result,
  });
});
//total users count by admin
const getTotalUsersCount = catchAsync(async (_req: Request, res: Response) => {
  const count = await userServices.getTotalUsersCount();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Total users count fetched successfully',
    data: count,
  });
});
//monthly user starts by admin
const getMonthlyUserStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await userServices.getMonthlyUserStats();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Monthly user stats fetched successfully',
    data: result,
  });
});
//Get 12-month user growth overview by admin
const getUserGrowthOverview = catchAsync(
  async (req: Request, res: Response) => {
    const year = req.query.year
      ? parseInt(req.query.year as string)
      : undefined;
    const result = await userServices.getUserGrowthPercentage(year);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: '12-month user growth fetched successfully',
      data: result,
    });
  },
);

export const userControllers = {
  getme,
  updateProfile,
  getsingleUser,
  getAllUsers,
  deleteAccount,
  updatePhoneNumber,
  getTotalUsersCount,
  getMonthlyUserStats,
  getUserGrowthOverview,
};
