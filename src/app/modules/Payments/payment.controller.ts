import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../error/AppError';
import stripe from '../../config/stripe';
import { PaymentService } from './payment.service';
import { sendEmail } from '../../utils/mailSender';
import { TUser } from '../user/user.interface';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../../../server';
import { sendUserNotification } from '../../../socketIo';
import { sendAdminNotification } from '../../../socketIo';

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

  try {
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
  } catch (error) {
    // Notify user about payment failure
    sendUserNotification(io, req.user?.id, {
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      type: 'payment',
    });

    // Notify admin about payment failure
    sendAdminNotification(io, {
      title: 'Payment Failed',
      message: `User ${req.user?.id} attempted a payment but it failed.`,
      type: 'payment',
    });

    // Respond with error
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error instanceof Error ? error.message : error,
    });
  }
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
  // Real-time notification to user
  sendUserNotification(io, userId, {
    title: 'Payment Successful',
    message: `Your payment of $${amount} was successful!`,
    type: 'payment',
  });
  // Real-time notification to all admins
  sendAdminNotification(io, {
    title: 'New Payment Received',
    message: `User ${userId} made a payment of $${amount}.`,
    type: 'payment',
  });

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
  const result = await PaymentService.getAllPayments(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payments retrieved successfully',
    data: result.data,
    meta: result.meta,
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
// Total Earnings from service
const getTotalEarnings = catchAsync(async (req: Request, res: Response) => {
  const total = await PaymentService.getTotalEarnings();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Total earnings fetched successfully',
    data: total,
  });
});

// Today's Earnings from service
const getTodaysEarnings = catchAsync(async (req: Request, res: Response) => {
  const total = await PaymentService.getTodaysEarnings();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Today's earnings fetched successfully",
    data: total,
  });
});
const getMonthlyEarningsStats = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentService.getMonthlyEarningsStats();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Monthly earnings stats fetched successfully',
      data: result,
    });
  },
);
const getEarningsOverview = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year ? parseInt(req.query.year as string) : undefined;
  const result = await PaymentService.get12MonthGrowthPercentage(year);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: '12-month earnings overview fetched successfully',
    data: result,
  });
});
export const PaymentController = {
  createPaymentIntent,
  savePayment,
  getAllPayments,
  getSinglePayment,
  getTotalEarnings,
  getTodaysEarnings,
  getMonthlyEarningsStats,
  getEarningsOverview,
};
