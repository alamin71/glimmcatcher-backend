import { Types } from 'mongoose';

export interface IPayment {
  user: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  amount: number;
  transactionId: string;
  invoiceId?: string;
  status: 'succeeded' | 'failed' | 'pending';
  paymentDate?: Date;
}
