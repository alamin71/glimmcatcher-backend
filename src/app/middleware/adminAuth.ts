import { Request, Response, NextFunction } from 'express';
import AppError from '../error/AppError';

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'super_admin') {
    return next(new AppError(403, 'Access denied: Admins only'));
  }
  next();
};
