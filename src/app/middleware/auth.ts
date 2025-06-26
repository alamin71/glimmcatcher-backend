// /* eslint-disable @typescript-eslint/no-unused-vars */
// import httpStatus from 'http-status';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import config from '../config/index';
// import AppError from '../error/AppError';
// import User from '../modules/user/user.model';
// import catchAsync from '../utils/catchAsync';

// const auth = (...userRoles: string[]) => {
//   return catchAsync(async (req, res, next) => {
//     const token = req?.headers?.authorization?.split(' ')[1];

//     if (!token) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'you are not authorized!');
//     }
//     let decode;
//     try {
//       decode = jwt.verify(
//         token,
//         config.jwt_access_secret as string,
//       ) as JwtPayload;
//       console.log('Token Decode:', decode);
//     } catch (err) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'unauthorized');
//     }
//     const { role, userId } = decode as JwtPayload;
//     console.log('JWT Decode:', decode);
//     const isUserExist = await User.IsUserExistbyId(userId);
//     if (!isUserExist) {
//       throw new AppError(httpStatus.NOT_FOUND, 'user not found');
//     }
//     if (userRoles && !userRoles.includes(role)) {
//       throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
//     }
//     req.user = decode;
//     next();
//   });
// };
// export default auth;
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/index';
import AppError from '../error/AppError';
import User from '../modules/user/user.model';
import catchAsync from '../utils/catchAsync';

const auth = (...userRoles: string[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req?.headers?.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    let decode;
    try {
      decode = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
      console.log('Token Decode:', decode);
    } catch (err) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Unauthorized! Invalid token',
      );
    }

    // ✅ Fix: Handle both id and userId from token payload
    const id = (decode as any).userId || decode?.id; // fallback if either exists
    const role = (decode as any).role;

    if (!id) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token payload');
    }

    // ✅ User existence check
    const isUserExist = await User.IsUserExistbyId(id);
    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // ✅ Role check if required
    if (userRoles.length && !userRoles.includes(role)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You are not authorized for this role',
      );
    }

    // ✅ Attach user info to request
    req.user = { id, role }; // only assign required info
    next();
  });
};

export default auth;
