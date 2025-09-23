// src/modules/onboarding/onboarding.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadToS3 } from '../../utils/fileHelper';
import { Onboarding } from './onboarding.model';

const uploadOnboardingImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const uploadedImages = [];

  for (const file of files) {
    const image = await uploadToS3(file, 'onboarding/');
    uploadedImages.push(image); // {id, url}
  }

  const result = await Onboarding.create({ images: uploadedImages });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Onboarding images uploaded successfully',
    data: result,
  });
});

const getOnboardingImages = catchAsync(async (req: Request, res: Response) => {
  const result = await Onboarding.findOne().sort({ createdAt: -1 }); // latest onboarding set
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Onboarding images retrieved successfully',
    data: result?.images || [],
  });
});

export const onboardingControllers = {
  uploadOnboardingImages,
  getOnboardingImages,
};
