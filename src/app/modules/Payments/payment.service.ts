import { Payment } from './payment.model';
import { IPayment } from './payment.interface';

const savePaymentDetails = async (payload: IPayment) => {
  return await Payment.create(payload);
};

export const PaymentService = {
  savePaymentDetails,
};
