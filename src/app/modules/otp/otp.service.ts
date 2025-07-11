// import httpStatus from 'http-status';
// import AppError from '../../error/AppError';
// import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
// import config from '../../config';
// // import { User } from '../user/user.model';
// import User from '../user/user.model';
// import { generateOtp } from '../../utils/otpGenerator';
// import moment from 'moment';
// import { sendEmail } from '../../utils/mailSender';

// const verifyOtp = async (token: string, otp: string | number) => {
//   console.log(otp, 'otp');
//   if (!token) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'you are not authorized!');
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
//       'session has expired.please try to submit otp withing 1 minute',
//     );
//   }
//   const user = await User.findById(decode?.id).select('verification status');
//   if (!user) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'user not found');
//   }
//   if (new Date() > user?.verification?.expiresAt) {
//     throw new AppError(
//       httpStatus.FORBIDDEN,
//       'otp has expired. Please resend it',
//     );
//   }
//   if (Number(otp) !== Number(user?.verification?.otp)) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'otp did not match');
//   }

//   const updateUser = await User.findByIdAndUpdate(
//     user?._id,

//     {
//       $set: {
//         isVerified: true,
//         status: user?.status === 'active' ? user?.status : 'active',
//         verification: {
//           otp: 0,
//           expiresAt: moment().add(5, 'minute'),
//           status: true,
//         },
//       },
//     },
//     { new: true },
//   );
//   const jwtPayload = {
//     email: user?.email,
//     id: user?._id,
//   };
//   const jwtToken = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
//     expiresIn: '5m',
//   });
//   return { user: updateUser, token: jwtToken };
// };

// const resendOtp = async (email: string) => {
//   console.log(email);
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'user not found');
//   }
//   const otp = generateOtp();
//   const expiresAt = moment().add(5, 'minute');
//   const updateOtp = await User.findByIdAndUpdate(user?._id, {
//     $set: {
//       verification: {
//         otp,
//         expiresAt,
//         status: false,
//       },
//     },
//   });
//   if (!updateOtp) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       'failed to resend otp. please try again later',
//     );
//   }
//   const jwtPayload = {
//     email: user?.email,
//     id: user?._id,
//   };
//   const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
//     expiresIn: '2m',
//   });
//   await sendEmail(
//     user?.email!,
//     'Your One Time Otp',
//     `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//     <h2 style="color: #4CAF50;">Your One Time OTP</h2>
//     <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
//       <p style="font-size: 16px;">Your OTP Is: <strong>${otp}</strong></p>
//       <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiresAt.toLocaleString()}</p>
//     </div>
//   </div>`,
//   );
//   return { token };
// };

// export const otpServices = {
//   verifyOtp,
//   resendOtp,
// };

// // import httpStatus from 'http-status';
// // import AppError from '../../error/AppError';
// // import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
// // import config from '../../config';
// // import User from '../user/user.model';
// // import { generateOtp } from '../../utils/otpGenerator';
// // import moment from 'moment';
// // import { sendEmail } from '../../utils/mailSender';
// // import bcrypt from 'bcrypt';

// // const verifyOtp = async (token: string, otp: string | number) => {
// //   if (!token) {
// //     throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
// //   }

// //   let decode;
// //   try {
// //     decode = jwt.verify(
// //       token,
// //       config.jwt_access_secret as string,
// //     ) as JwtPayload;
// //   } catch (err) {
// //     throw new AppError(
// //       httpStatus.FORBIDDEN,
// //       'Session has expired. Please try again.',
// //     );
// //   }

// //   const { email, password, fullName, phoneNumber, countryCode } = decode;

// //   // OTP validate
// //   if (!decode?.otp || Number(otp) !== Number(decode?.otp)) {
// //     throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
// //   }

// //   // Check if user already exists
// //   const existingUser = await User.findOne({ email });
// //   if (existingUser) {
// //     throw new AppError(httpStatus.CONFLICT, 'User already exists');
// //   }

// //   // Create user
// //   const hashedPassword = await bcrypt.hash(
// //     password,
// //     Number(config.bcrypt_salt_rounds),
// //   );

// //   const newUser = await User.create({
// //     email,
// //     password: hashedPassword,
// //     fullName,
// //     phoneNumber,
// //     countryCode,
// //     isVerified: true,
// //     verification: {
// //       otp: 0,
// //       status: true,
// //       expiresAt: moment().add(5, 'minute').toDate(),
// //     },
// //   });

// //   const jwtPayload = {
// //     userId: newUser._id,
// //     role: newUser.role,
// //   };

// //   const jwtToken = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
// //     expiresIn: config.jwt_access_expires_in,
// //   });

// //   return { user: newUser, token: jwtToken };
// // };

// // const resendOtp = async (token: string) => {
// //   let decode;
// //   try {
// //     decode = jwt.verify(
// //       token,
// //       config.jwt_access_secret as string,
// //     ) as JwtPayload;
// //   } catch (err) {
// //     throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
// //   }

// //   const otp = generateOtp();
// //   const expiresAt = moment().add(2, 'minute').toDate();

// //   // Regenerate token with new OTP
// //   const newToken = jwt.sign(
// //     {
// //       ...decode,
// //       otp,
// //       expiresAt,
// //     },
// //     config.jwt_access_secret as Secret,
// //     { expiresIn: '5m' },
// //   );

// //   await sendEmail(
// //     decode.email,
// //     'Your One Time OTP',
// //     `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
// //       <h2 style="color: #4CAF50;">Your One Time OTP</h2>
// //       <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
// //         <p style="font-size: 16px;">Your OTP Is: <strong>${otp}</strong></p>
// //         <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiresAt.toLocaleString()}</p>
// //       </div>
// //     </div>`,
// //   );

// //   return { token: newToken };
// // };

// // export const otpServices = {
// //   verifyOtp,
// //   resendOtp,
// // };

import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../config';
import User from '../user/user.model';
import { generateOtp } from '../../utils/otpGenerator';
import moment from 'moment';
import { sendEmail } from '../../utils/mailSender';
import bcrypt from 'bcrypt';

type JwtPayloadExtended = JwtPayload & {
  mode?: 'signup' | 'reset-password';
  email?: string;
  id?: string;
  otp?: number;
  expiresAt?: Date;
  allowReset?: boolean;
};

const sendOtpEmail = async (email: string, otp: number, expiresAt: Date) => {
  await sendEmail(
    email,
    'Your One Time OTP',
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP Is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiresAt.toLocaleString()}</p>
      </div>
    </div>`,
  );
};

// ---------------
// 1. Signup: send OTP and return temp token
const initiateSignup = async (payload: {
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
  countryCode?: string;
  gender: 'Male' | 'Female';
}) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, 'User already exists');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(5, 'minute').toDate();

  // create token payload with user data + OTP info + mode signup
  const tokenPayload = {
    ...payload,
    otp,
    expiresAt,
    mode: 'signup',
  };

  const token = jwt.sign(tokenPayload, config.jwt_access_secret as Secret, {
    expiresIn: '5m',
  });

  // send email
  await sendOtpEmail(payload.email, otp, expiresAt);

  // return { token };
  return {
    token,
    ...(process.env.NODE_ENV !== 'production' && { otp }), // only show OTP in dev
  };
};

// 2. Signup: verify OTP & create user
const verifySignupOtp = async (token: string, otp: string | number) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Token is required');
  }

  let decoded: JwtPayloadExtended;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayloadExtended;
  } catch {
    throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
  }

  if (decoded.mode !== 'signup') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid token for signup verification',
    );
  }

  if (!decoded.otp || !decoded.expiresAt) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token data');
  }

  if (new Date() > new Date(decoded.expiresAt)) {
    throw new AppError(httpStatus.FORBIDDEN, 'OTP expired');
  }

  if (Number(otp) !== Number(decoded.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  // Create user now
  // const hashedPassword = await bcrypt.hash(decoded.password!, 12);
  const newUser = await User.create({
    email: decoded.email,
    fullName: decoded.fullName,
    password: decoded.password, // raw password, let pre-save hook hash it
    phoneNumber: decoded.phoneNumber,
    countryCode: decoded.countryCode,
    gender: decoded.gender,
    isVerified: true,
    role: 'user',
  });

  // Generate access token for login
  const accessToken = jwt.sign(
    { id: newUser._id, role: newUser.role },
    config.jwt_access_secret as Secret,
    { expiresIn: '30d' },
  );

  return { user: newUser, token: accessToken };
};

// 3. Resend Signup OTP
// const resendSignupOtp = async (token: string) => {
//   if (!token) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Token is required');
//   }
//   let decoded: JwtPayloadExtended;
//   try {
//     decoded = jwt.verify(
//       token,
//       config.jwt_access_secret as string,
//     ) as JwtPayloadExtended;
//   } catch {
//     throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
//   }

//   if (decoded.mode !== 'signup' || !decoded.email) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token for resend OTP');
//   }

//   const otp = generateOtp();
//   const expiresAt = moment().add(5, 'minute').toDate();

//   // regenerate token with new OTP and expiry
//   const newTokenPayload = {
//     ...decoded,
//     otp,
//     expiresAt,
//   };

//   const newToken = jwt.sign(
//     newTokenPayload,
//     config.jwt_access_secret as Secret,
//     {
//       expiresIn: '5m',
//     },
//   );

//   await sendOtpEmail(decoded.email, otp, expiresAt);

//   return { token: newToken };
// };
const resendSignupOtp = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Token is required');
  }
  let decoded: JwtPayloadExtended;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayloadExtended;
  } catch {
    throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
  }

  if (decoded.mode !== 'signup' || !decoded.email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token for resend OTP');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(5, 'minute').toDate();

  // decoded থেকে exp, iat বাদ দিয়ে নতুন payload তৈরি করলাম
  const { exp, iat, ...safeDecoded } = decoded;

  const newTokenPayload = {
    ...safeDecoded,
    otp,
    expiresAt,
  };

  const newToken = jwt.sign(
    newTokenPayload,
    config.jwt_access_secret as Secret,
    {
      expiresIn: '10m',
    },
  );

  await sendOtpEmail(decoded.email, otp, expiresAt);

  return {
    token: newToken,
    ...(process.env.NODE_ENV !== 'production' && { otp }), // dev mode এ otp রিটার্ন করবে
  };
};

// 4. Forgot password - send OTP and token
const initiateForgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const otp = generateOtp();
  const expiresAt = moment().add(5, 'minute').toDate();

  // Save OTP and expiry to user doc if you want (optional)
  user.verification = {
    otp,
    expiresAt,
    status: false,
  };
  await user.save();

  // Token payload for forgot-password mode
  const tokenPayload = {
    id: user._id,
    email: user.email,
    mode: 'reset-password',
  };

  const token = jwt.sign(tokenPayload, config.jwt_access_secret as Secret, {
    expiresIn: '10m',
  });

  await sendOtpEmail(email, otp, expiresAt);

  // return { token };
  return {
    token,
    ...(process.env.NODE_ENV !== 'production' && { otp }), // only show OTP in dev
  };
};

// 5. Verify forgot password OTP and allow reset
const verifyForgotPasswordOtp = async (token: string, otp: string | number) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Token is required');
  }

  let decoded: JwtPayloadExtended;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayloadExtended;
  } catch {
    throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
  }

  if (decoded.mode !== 'reset-password' || !decoded.id) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid token for password reset',
    );
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (
    !user.verification ||
    !user.verification.otp ||
    !user.verification.expiresAt
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP data missing');
  }

  if (new Date() > new Date(user.verification.expiresAt)) {
    throw new AppError(httpStatus.FORBIDDEN, 'OTP expired');
  }

  if (Number(otp) !== Number(user.verification.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  // OTP verified - set allowReset flag in token
  const resetToken = jwt.sign(
    {
      id: user._id,
      allowReset: true,
      mode: 'reset-password',
    },
    config.jwt_access_secret as Secret,
    { expiresIn: '10m' },
  );

  // Update user verification status
  user.verification.status = true;
  await user.save();

  return { user, token: resetToken };
};

// 6. Resend forgot password OTP
const resendForgotPasswordOtp = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Token is required');
  }
  let decoded: JwtPayloadExtended;
  try {
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayloadExtended;
  } catch {
    throw new AppError(httpStatus.FORBIDDEN, 'Token expired or invalid');
  }

  if (decoded.mode !== 'reset-password' || !decoded.id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid token for resend OTP');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const otp = Number(generateOtp());
  const expiresAt = moment().add(5, 'minute').toDate();

  user.verification = {
    otp,
    expiresAt,
    status: false,
  };
  await user.save();

  const newToken = jwt.sign(
    {
      id: user._id,
      mode: 'reset-password',
    },
    config.jwt_access_secret as Secret,
    { expiresIn: '10m' },
  );

  await sendOtpEmail(user.email, otp, expiresAt);

  return { token: newToken };
};

export const otpServices = {
  initiateSignup,
  verifySignupOtp,
  resendSignupOtp,
  initiateForgotPassword,
  verifyForgotPasswordOtp,
  resendForgotPasswordOtp,
};
