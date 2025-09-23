// // src/modules/onboarding/onboarding.controller.ts
// import { Request, Response } from 'express';
// import catchAsync from '../../utils/catchAsync';
// import sendResponse from '../../utils/sendResponse';
// import { uploadToS3 } from '../../utils/fileHelper';
// import { Onboarding } from './onboarding.model';

// const uploadOnboardingImages = catchAsync(async (req: Request, res: Response) => {
//   const files = req.files as Express.Multer.File[];
//   const uploadedImages = [];

//   for (const file of files) {
//     const image = await uploadToS3(file, 'onboarding/');
//     uploadedImages.push(image); // {id, url}
//   }

//   const result = await Onboarding.create({ images: uploadedImages });

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Onboarding images uploaded successfully',
//     data: result,
//   });
// });

// const getOnboardingImages = catchAsync(async (req: Request, res: Response) => {
//   const result = await Onboarding.findOne().sort({ createdAt: -1 }); // latest onboarding set
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Onboarding images retrieved successfully',
//     data: result?.images || [],
//   });
// });

// export const onboardingControllers = {
//   uploadOnboardingImages,
//   getOnboardingImages,
// };
// src/modules/onboarding/onboarding.controller.ts
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadToS3 } from '../../utils/fileHelper';
import { Onboarding } from './onboarding.model';

// POST (create new set of images)
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

// PUT (update latest set of images)
const updateOnboardingImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const uploadedImages = [];

  for (const file of files) {
    const image = await uploadToS3(file, 'onboarding/');
    uploadedImages.push(image); // {id, url}
  }

  // find latest onboarding doc
  let latest = await Onboarding.findOne().sort({ createdAt: -1 });

  if (!latest) {
    // if no previous exists, create new
    latest = await Onboarding.create({ images: uploadedImages });
  } else {
    // update existing latest doc
    latest.images = uploadedImages;
    await latest.save();
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Onboarding images updated successfully',
    data: latest,
  });
});

// Always return the latest
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
  updateOnboardingImages,
  getOnboardingImages,
};
