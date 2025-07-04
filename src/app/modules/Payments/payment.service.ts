import { Payment } from './payment.model';
import { IPayment } from './payment.interface';

const savePaymentDetails = async (payload: IPayment) => {
  const payment = await Payment.create(payload);

  // ✅ Populate user field to access user.email
  return await payment.populate('user');
};
const getAllPayments = async () => {
  const payments = await Payment.find()
    .populate('user') // user details (email, name, etc.)
    .populate('subscriptionId'); // subscription details (title, price, etc.)
  return payments;
};

export const PaymentService = {
  savePaymentDetails,
  getAllPayments,
};
