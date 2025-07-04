import { Payment } from './payment.model';
import { IPayment } from './payment.interface';

const savePaymentDetails = async (payload: IPayment) => {
  const created = await Payment.create(payload);
  return await Payment.findById(created._id)
    .populate('user')
    .populate('subscriptionId');
};

const getAllPayments = async () => {
  const payments = await Payment.find()
    .populate('user')
    .populate('subscriptionId');
  return payments;
};

export const PaymentService = {
  savePaymentDetails,
  getAllPayments,
};
