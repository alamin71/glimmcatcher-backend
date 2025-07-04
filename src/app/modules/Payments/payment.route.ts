import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';

const router = express.Router();

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

export const PaymentRoutes = router;
