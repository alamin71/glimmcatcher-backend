import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import stripe from '../../config/stripe';
import { PaymentService } from './payment.service';

// const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
//   const { amount } = req.body;

//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: Math.round(amount * 100), // cents
//     currency: 'usd',
//     payment_method_types: ['card'],
//   });

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: 'Payment intent created',
//     data: {
//       clientSecret: paymentIntent.client_secret,
//     },
//   });
// });
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

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment details saved successfully',
    data: result,
  });
});

export const PaymentController = {
  createPaymentIntent,
  savePayment,
};
