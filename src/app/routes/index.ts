import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { contentRoues } from '../modules/content/content.route';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';
import walletRoutes from '../modules/wallet/wallet.route';
import { adminRoutes } from '../modules/Dashboard/admin/admin.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },

  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },
  {
    path: '/wallet',
    route: walletRoutes,
  },
  {
    path: '/content',
    route: contentRoues,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
