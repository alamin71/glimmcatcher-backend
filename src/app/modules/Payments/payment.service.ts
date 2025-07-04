import { Payment } from './payment.model';
import { IPayment } from './payment.interface';

const savePaymentDetails = async (payload: IPayment) => {
  const created = await Payment.create(payload);
  return await Payment.findById(created._id)
    .populate('user')
    .populate('subscriptionId');
};
const getSinglePayment = async (id: string) => {
  return await Payment.findById(id).populate('user').populate('subscriptionId');
};

const getAllPayments = async () => {
  const payments = await Payment.find()
    .populate('user')
    .populate('subscriptionId');
  return payments;
};
const getTotalEarnings = async (): Promise<number> => {
  const result = await Payment.aggregate([
    { $match: { status: 'succeeded' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};

//Today's Earnings
const getTodaysEarnings = async (): Promise<number> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const result = await Payment.aggregate([
    {
      $match: {
        status: 'succeeded',
        paymentDate: { $gte: today, $lt: tomorrow },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};

export const PaymentService = {
  savePaymentDetails,
  getSinglePayment,
  getAllPayments,
  getTotalEarnings,
  getTodaysEarnings,
};
