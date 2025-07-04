// /* eslint-disable @typescript-eslint/no-explicit-any */
// import bcrypt from 'bcrypt';
// import httpStatus from 'http-status';
// import AppError from '../../error/AppError';

// import { TUser } from './user.interface';
// import User from './user.model';
// // // customer

// // // login with google customer

// // // provider

// // // employee

// // const signupuser = async (payload: TUser) => {
// //   const result = await User.create(payload);

// //   return result;
// // };

// const getme = async (id: string) => {
//   const result = await User.findById(id);
//   const data = {
//     email: result?.email,
//     fullName: result?.fullName,
//     countryCode: result?.countryCode,
//     phoneNumber: result?.phoneNumber,
//     image: result?.image ?? {},
//   };
//   return data;
// };

// const updateProfile = async (id: string, payload: Partial<TUser>) => {
//   const user = await User.findById(id);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found !!');
//   }

//   // Prevent updating phoneNumber
//   if (payload?.phoneNumber) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'phoneNumber is not for update');
//   }

//   // Prevent updating role
//   if (payload?.role) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'role is not for update');
//   }

//   // Perform the update and return the updated user
//   const result = await User.findByIdAndUpdate(id, payload, {
//     new: true,
//   });

//   return result;
// };

// const getAllUsers = async () => {
//   const users = await User.find();
//   return users;
// };

// const getSingleUser = async (id: string) => {
//   const result = await User.findById(id);
//   return result;
// };
// const deleteAccount = async (id: string, password: string) => {
//   const user = await User.IsUserExistbyId(id);
//   const isPasswordMatched = await bcrypt.compare(password, user?.password);
//   if (!isPasswordMatched) {
//     throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Password does not match!');
//   }
//   const result = await User.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         isDeleted: true,
//       },
//     },
//     {
//       new: true,
//     },
//   );
//   return result;
// };

// const updatePhoneNumber = async (id: string, payload: any) => {
//   const result = await User.findByIdAndUpdate(id, payload);
//   return result;
// };

// export const userServices = {
//   getme,
//   updateProfile,
//   getSingleUser,
//   deleteAccount,
//   updatePhoneNumber,
//   getAllUsers,
//   // signupuser,
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
// import bcrypt from 'bcrypt';
// import httpStatus from 'http-status';
// import AppError from '../../error/AppError';
// import jwt, { Secret } from 'jsonwebtoken';

// import { TUser } from './user.interface';
// import User from './user.model';
// import moment from 'moment';
// import { generateOtp } from '../../utils/otpGenerator';
// import { sendEmail } from '../../utils/mailSender';
// import config from '../../config';

// const signupuser = async (payload: TUser) => {
//   const otp = generateOtp();
//   const expiresAt = moment().add(5, 'minute');

//   //   // const hashedPassword = await bcrypt.hash(
//   //   //   payload.password,
//   //   //   Number(config.bcrypt_salt_rounds),
//   //   // );

//   const userData: TUser = {
//     ...payload,
//     // password: hashedPassword,
//     isVerified: false,
//     verification: {
//       otp,
//       expiresAt: expiresAt.toDate(),
//       status: false,
//     },
//   };

//   const result = await User.create(userData);
//   //  Token generate
//   const jwtPayload = {
//     email: result?.email,
//     id: result?._id,
//   };
//   const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
//     expiresIn: '5m',
//   });

//   await sendEmail(
//     result.email!,
//     'Verify Your Email',
//     `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
//       <h2 style="color: #4CAF50;">Your One-Time OTP</h2>
//       <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
//         <p>Your OTP is: <strong>${otp}</strong></p>
//         <p>This OTP will expire in 5 minutes.</p>
//       </div>
//     </div>`,
//   );
//   return {
//     user: result,
//     token,
//   };
// };

// const getme = async (id: string) => {
//   const result = await User.findById(id);
//   const data = {
//     email: result?.email,
//     fullName: result?.fullName,
//     countryCode: result?.countryCode,
//     phoneNumber: result?.phoneNumber,
//     image: result?.image ?? {},
//     isVerified: result?.isVerified,
//   };
//   return data;
// };

// const updateProfile = async (id: string, payload: Partial<TUser>) => {
//   const user = await User.findById(id);
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found !!');
//   }

//   if (payload?.phoneNumber) {
//     throw new AppError(
//       httpStatus?.BAD_REQUEST,
//       'phoneNumber is not for update',
//     );
//   }
//   if (payload?.role) {
//     throw new AppError(httpStatus?.BAD_REQUEST, 'role is not for update');
//   }

//   const result = await User.findByIdAndUpdate(id, payload, { new: true });
//   return result;
// };

// const getSingleUser = async (id: string) => {
//   const result = await User.findById(id);
//   return result;
// };
// const getAllUsers = async () => {
//   const users = await User.find();
//   return users;
// };

// const deleteAccount = async (id: string, password: string) => {
//   const user = await User.findById(id).select('+password');
//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }

//   const isPasswordMatched = await bcrypt.compare(password, user.password);
//   if (!isPasswordMatched) {
//     throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Password does not match!');
//   }

//   const result = await User.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         isDeleted: true,
//       },
//     },
//     {
//       new: true,
//     },
//   );
//   return result;
// };

// const updatePhoneNumber = async (id: string, payload: any) => {
//   const result = await User.findByIdAndUpdate(id, payload, { new: true });
//   return result;
// };

// export const userServices = {
//   getme,
//   updateProfile,
//   getSingleUser,
//   getAllUsers,
//   deleteAccount,
//   updatePhoneNumber,
//   signupuser,
// };

import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';

import { TUser } from './user.interface';
import User from './user.model';

const getme = async (id: string) => {
  const result = await User.findById(id);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return {
    email: result.email,
    fullName: result.fullName,
    countryCode: result.countryCode,
    phoneNumber: result.phoneNumber,
    image: result.image ?? {},
  };
};

// const updateProfile = async (id: string, payload: Partial<TUser>) => {
//   const user = await User.findById(id);

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'User not found');
//   }

//   if (payload?.phoneNumber) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'phoneNumber is not allowed to update',
//     );
//   }

//   if (payload?.role) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'role is not allowed to update');
//   }

//   const updatedUser = await User.findByIdAndUpdate(id, payload, {
//     new: true,
//   });

//   return updatedUser;
// };
const updateProfile = async (id: string, payload: Partial<TUser>) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const restrictedFields = ['phoneNumber', 'role', 'email'];
  restrictedFields.forEach((field) => {
    if (field in payload) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${field} is not allowed to update`,
      );
    }
  });

  // Allow updating image, fullName, gender
  const updatedUser = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return updatedUser;
};

const getAllUsers = async () => {
  // Only return users who are not soft-deleted
  const users = await User.find({ isDeleted: { $ne: true } });
  return users;
};

const getSingleUser = async (id: string) => {
  const result = await User.findById(id);

  if (!result || result.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

const deleteAccount = async (id: string, password: string) => {
  const user = await User.IsUserExistbyId(id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Password does not match!');
  }

  const result = await User.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true },
  );

  return result;
};

const updatePhoneNumber = async (id: string, payload: Partial<TUser>) => {
  const allowedPayload = {
    phoneNumber: payload.phoneNumber,
    countryCode: payload.countryCode,
  };

  const result = await User.findByIdAndUpdate(id, allowedPayload, {
    new: true,
  });

  return result;
};
const getTotalUsersCount = async () => {
  const count = await User.countDocuments({ isDeleted: { $ne: true } });
  return count;
};

export const userServices = {
  getme,
  updateProfile,
  getSingleUser,
  deleteAccount,
  updatePhoneNumber,
  getAllUsers,
  getTotalUsersCount,
};
