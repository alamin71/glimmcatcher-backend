// /* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';

import { TUser } from './user.interface';
import User from './user.model';
// // customer

// // login with google customer

// // provider

// // employee

const signupuser = async (payload: TUser) => {
  const result = await User.create(payload);

  return result;
};

const getme = async (id: string) => {
  const result = await User.findById(id);
  const data = {
    email: result?.email,
    fullName: result?.fullName,
    countryCode: result?.countryCode,
    phoneNumber: result?.phoneNumber,
    image: result?.image ?? {},
  };
  return data;
};

const updateProfile = async (id: string, payload: Partial<TUser>) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found !!');
  }
  //  email update lagbe na
  if (payload?.phoneNumber) {
    throw new AppError(
      httpStatus?.BAD_REQUEST,
      'phoneNumber is not for update',
    );
  }
  if (payload?.role) {
    throw new AppError(httpStatus?.BAD_REQUEST, 'role is not for update');
  }
  let result;

  return result;
};

const getSingleUser = async (id: string) => {
  const result = await User.findById(id);
  return result;
};
const deleteAccount = async (id: string, password: string) => {
  const user = await User.IsUserExistbyId(id);
  const isPasswordMatched = await bcrypt.compare(password, user?.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Password does not match!');
  }
  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        isDeleted: true,
      },
    },
    {
      new: true,
    },
  );
  return result;
};

const updatePhoneNumber = async (id: string, payload: any) => {
  const result = await User.findByIdAndUpdate(id, payload);
  return result;
};

export const userServices = {
  getme,
  updateProfile,
  getSingleUser,
  deleteAccount,
  updatePhoneNumber,
  signupuser,
};

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
