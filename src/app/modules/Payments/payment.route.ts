import { Router } from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router();

router.post(
  '/create-payment-intent',
  auth(USER_ROLE.user), // Only logged in users
  PaymentController.createPaymentIntent,
);

router.post(
  '/save-payment',
  auth(USER_ROLE.user),
  PaymentController.savePayment,
);
router.get(
  '/all',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  PaymentController.getAllPayments,
);
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  PaymentController.getSinglePayment,
);

router.get(
  '/total-earnings',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  PaymentController.getTotalEarnings,
);
router.get(
  '/todays-earnings',
  auth(USER_ROLE.admin, USER_ROLE.sup_admin),
  PaymentController.getTodaysEarnings,
);

export const PaymentRoutes = router;
