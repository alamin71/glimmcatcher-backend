import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config';
// import { User } from '../user/user.model';
import User from '../user/user.model';
import { generateOtp } from '../../utils/otpGenerator';
import moment from 'moment';
import { sendEmail } from '../../utils/mailSender';

const verifyOtp = async (token: string, otp: string | number) => {
  console.log(otp, 'otp');
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'you are not authorized!');
  }
  let decode;
  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'session has expired.please try to submit otp withing 1 minute',
    );
  }
  const user = await User.findById(decode?.id).select('verification status');
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user not found');
  }
  if (new Date() > user?.verification?.expiresAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'otp has expired. Please resend it',
    );
  }
  if (Number(otp) !== Number(user?.verification?.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'otp did not match');
  }

  const updateUser = await User.findByIdAndUpdate(
    user?._id,

    {
      $set: {
        isVerified: true,
        status: user?.status === 'active' ? user?.status : 'active',
        verification: {
          otp: 0,
          expiresAt: moment().add(5, 'minute'),
          status: true,
        },
      },
    },
    { new: true },
  );
  const jwtPayload = {
    email: user?.email,
    id: user?._id,
  };
  const jwtToken = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '5m',
  });
  return { user: updateUser, token: jwtToken };
};

const resendOtp = async (email: string) => {
  console.log(email);
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'user not found');
  }
  const otp = generateOtp();
  const expiresAt = moment().add(5, 'minute');
  const updateOtp = await User.findByIdAndUpdate(user?._id, {
    $set: {
      verification: {
        otp,
        expiresAt,
        status: false,
      },
    },
  });
  if (!updateOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'failed to resend otp. please try again later',
    );
  }
  const jwtPayload = {
    email: user?.email,
    id: user?._id,
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '2m',
  });
  await sendEmail(
    user?.email!,
    'Your One Time Otp',
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4CAF50;">Your One Time OTP</h2>
    <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
      <p style="font-size: 16px;">Your OTP Is: <strong>${otp}</strong></p>
      <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiresAt.toLocaleString()}</p>
    </div>
  </div>`,
  );
  return { token };
};

export const otpServices = {
  verifyOtp,
  resendOtp,
};

// import httpStatus from 'http-status';
// import AppError from '../../error/AppError';
// import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
// import config from '../../config';
// import User from '../user/user.model';
// import { generateOtp } from '../../utils/otpGenerator';
// import moment from 'moment';
// import { sendEmail } from '../../utils/mailSender';
// import bcrypt from 'bcrypt';

// const verifyOtp = async (token: string, otp: string | number) => {
//   if (!token) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
//   }

//   let decode;
//   try {
//     decode = jwt.verify(
//       token,
//       config.jwt_access_secret as string,
//     ) as JwtPayload;
//   } catch (err) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       'Session has expired. Please try again.',
//     );
//   }

//   const { email, password, fullName, phoneNumber, countryCode } = decode;

//   // OTP validate
//   if (!decode?.otp || Number(otp) !== Number(decode?.otp)) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
//   }

//   // Check if user already exists
//   const existingUser = await User.findOne({ email });
//   if (existingUser) {
//     throw new AppError(httpStatus.CONFLICT, 'User already exists');
//   }

//   // Create user
//   const hashedPassword = await bcrypt.hash(
//     password,
//     Number(config.bcrypt_salt_rounds),
//   );

//   const newUser = await User.create({
//     email,
//     password: hashedPassword,
//     fullName,
//     phoneNumber,
//     countryCode,
//     isVerified: true,
//     verification: {
//       otp: 0,
//       status: true,
//       expiresAt: moment().add(5, 'minute').toDate(),
//     },
//   });

//   const jwtPayload = {
//     userId: newUser._id,
//     role: newUser.role,
//   };

//   const jwtToken = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
//     expiresIn: config.jwt_access_expires_in,
//   });

//   return { user: newUser, token: jwtToken };
// };

// const resendOtp = async (token: string) => {
//   let decode;
//   try {
//     decode = jwt.verify(
//       token,
//       config.jwt_access_secret as string,
//     ) as JwtPayload;
//   } catch (err) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
//   }

//   const otp = generateOtp();
//   const expiresAt = moment().add(2, 'minute').toDate();

//   // Regenerate token with new OTP
//   const newToken = jwt.sign(
//     {
//       ...decode,
//       otp,
//       expiresAt,
//     },
//     config.jwt_access_secret as Secret,
//     { expiresIn: '5m' },
//   );

//   await sendEmail(
//     decode.email,
//     'Your One Time OTP',
//     `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <h2 style="color: #4CAF50;">Your One Time OTP</h2>
//       <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
//         <p style="font-size: 16px;">Your OTP Is: <strong>${otp}</strong></p>
//         <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiresAt.toLocaleString()}</p>
//       </div>
//     </div>`,
//   );

//   return { token: newToken };
// };

// export const otpServices = {
//   verifyOtp,
//   resendOtp,
// };
