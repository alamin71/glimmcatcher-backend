// import { Request, Response } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import catchAsync from '../../utils/catchAsync';
// import sendResponse from '../../utils/sendResponse';
// import AppError from '../../error/AppError';
// import stripe from '../../config/stripe';
// import { PaymentService } from './payment.service';
// import { sendEmail } from '../../utils/mailSender';
// import { TUser } from '../user/user.interface';

// const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
//   let { amount } = req.body;

//   if (amount === undefined || isNaN(Number(amount))) {
//     return res.status(StatusCodes.BAD_REQUEST).json({
//       success: false,
//       message: 'Amount is required and must be a valid number',
//     });
//   }

//   amount = Number(amount);

//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: Math.round(amount * 100),
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

// const savePayment = catchAsync(async (req: Request, res: Response) => {
//   const { subscriptionId, amount, transactionId, invoiceId, status } = req.body;
//   const userId = req.user?.id;

//   const result = await PaymentService.savePaymentDetails({
//     user: userId,
//     subscriptionId,
//     amount,
//     transactionId,
//     invoiceId,
//     status,
//     paymentDate: new Date(),
//   });
//   if (!result) {
//     throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to save payment!');
//   }
//   // ✅ Email sending
//   const userEmail = (result.user as TUser).email;

//   if (userEmail) {
//     await sendEmail(
//       userEmail,
//       'Payment Successful',
//       `
//       <h2>Payment Confirmation</h2>
//       <p>Thank you for your payment of <strong>$${amount}</strong>.</p>
//       <p>Transaction ID: ${transactionId}</p>
//       <p>Invoice ID: ${invoiceId || 'N/A'}</p>
//       <p>Status: ${status}</p>
//       <p>Thank you for your subscription!</p>
//       `,
//     );
//   }

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: 'Payment details saved successfully',
//     data: result,
//   });
// });

// const getAllPayments = catchAsync(async (req: Request, res: Response) => {
//   const result = await PaymentService.getAllPayments();

//   sendResponse(res, {
//     statusCode: StatusCodes.OK,
//     success: true,
//     message: 'Payments retrieved successfully',
//     data: result,
//   });
// });

// export const PaymentController = {
//   createPaymentIntent,
//   savePayment,
//   getAllPayments,
// };
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';
import stripe from '../../config/stripe';
import { PaymentService } from './payment.service';
import { sendEmail } from '../../utils/mailSender';
import { TUser } from '../user/user.interface';
import { v4 as uuidv4 } from 'uuid'; // install uuid: npm i uuid

// Helper to generate invoiceId if none from Stripe
const generateInvoiceId = (): string => {
  return `INV-${uuidv4()}`;
};

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  let { amount } = req.body;

  if (amount === undefined || isNaN(Number(amount))) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Amount is required and must be a valid number',
    });
  }

  amount = Number(amount);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
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
  const {
    subscriptionId,
    amount,
    transactionId,
    invoiceId: clientInvoiceId,
    status,
  } = req.body;
  const userId = req.user?.id;

  if (!transactionId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Transaction ID is required');
  }

  // Retrieve PaymentIntent from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);

  // Get Stripe invoice ID if exists
  const stripeInvoiceId = paymentIntent.invoice || null;

  // Decide final invoice ID
  const finalInvoiceId =
    clientInvoiceId || stripeInvoiceId || generateInvoiceId();

  const result = await PaymentService.savePaymentDetails({
    user: userId,
    subscriptionId,
    amount,
    transactionId,
    invoiceId: finalInvoiceId,
    status,
    paymentDate: new Date(),
  });

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to save payment!');
  }

  // Email sending
  const userEmail = (result.user as TUser).email;

  if (userEmail) {
    await sendEmail(
      userEmail,
      'Payment Successful',
      `
      <h2>Payment Confirmation</h2>
      <p>Thank you for your payment of <strong>$${amount}</strong>.</p>
      <p>Transaction ID: ${transactionId}</p>
      <p>Invoice ID: ${finalInvoiceId}</p>
      <p>Status: ${status}</p>
      <p>Thank you for your subscription!</p>
      `,
    );
  }

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

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await PaymentService.getSinglePayment(id);

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment retrieved successfully',
    data: result,
  });
});
// ✅ Total Earnings from service
const getTotalEarnings = catchAsync(async (req: Request, res: Response) => {
  const total = await PaymentService.getTotalEarnings();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Total earnings fetched successfully',
    data: total,
  });
});

// ✅ Today's Earnings from service
const getTodaysEarnings = catchAsync(async (req: Request, res: Response) => {
  const total = await PaymentService.getTodaysEarnings();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Today's earnings fetched successfully",
    data: total,
  });
});

export const PaymentController = {
  createPaymentIntent,
  savePayment,
  getAllPayments,
  getSinglePayment,
  getTotalEarnings,
  getTodaysEarnings,
};
