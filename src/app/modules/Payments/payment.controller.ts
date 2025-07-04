import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import stripe from '../../config/stripe';
import { PaymentService } from './payment.service';
import { sendEmail } from '../../utils/mailSender';
import { TUser } from '../user/user.interface';
import { Payment } from './payment.model';

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  let { amount } = req.body;

  // ✅ Validation
  if (amount === undefined || isNaN(Number(amount))) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Amount is required and must be a valid number',
    });
  }

  amount = Number(amount); // Convert if string

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: 'usd',
    payment_method_types: ['card'],
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment intent created',
    data: {
      clientSecret: paymentIntent.client_secret,
    },
  });
});

const savePayment = catchAsync(async (req: Request, res: Response) => {
  const { user, subscriptionId, amount, transactionId, invoiceId, status } =
    req.body;

  const result = await PaymentService.savePaymentDetails({
    user,
    subscriptionId,
    amount,
    transactionId,
    invoiceId,
    status,
    paymentDate: new Date(),
  });
  const getAllPayments = async () => {
    const payments = await Payment.find()
      .populate('user') // user details (email, name, etc.)
      .populate('subscriptionId'); // subscription details (title, price, etc.)
    return payments;
  };

  // ✅ Send confirmation email
  await sendEmail(
    (result.user as TUser).email,
    'Payment Successful',
    `<h2>Payment Confirmation</h2>
   <p>Thank you for your payment of <strong>$${amount}</strong>.</p>
   <p>Transaction ID: ${transactionId}</p>
   <p>Invoice ID: ${invoiceId || 'N/A'}</p>
   <p>Status: ${status}</p>
   <p>Thank you for your subscription!</p>
  `,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment details saved successfully',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payments retrieved successfully',
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
  savePayment,
  getAllPayments,
};
