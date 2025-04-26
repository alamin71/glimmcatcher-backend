/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';

import { TUser } from './user.interface';
import User from './user.model';
// customer

// login with google customer

// provider

// employee

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
