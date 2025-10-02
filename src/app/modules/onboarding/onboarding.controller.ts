
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { uploadToS3 } from '../../utils/fileHelper';
import { Onboarding } from './onboarding.model';


const uploadOnboardingImages = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const { titles, descriptions } = req.body;

  const uploadedImages = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const image = await uploadToS3(file, 'onboarding/');
    uploadedImages.push({
      id: image.id,
      url: image.url,
      key: `img${i + 1}`, // assign logical id
      title: Array.isArray(titles) ? titles[i] : titles,
      description: Array.isArray(descriptions) ? descriptions[i] : descriptions,
    });
  }

  const result = await Onboarding.create({ images: uploadedImages });
  sendResponse(res, { statusCode: 200, success: true, message: 'Onboarding images uploaded successfully', data: result });
});

// Update 1, 2, or 3 images partially
interface IUpdateImage {
  key: string;          // logical id: img1, img2, etc
  title?: string;
  description?: string;
  filename?: string;    // uploaded file name
}

// export const updateOnboardingImages = catchAsync(async (req: Request, res: Response) => {
//   const latest = await Onboarding.findOne().sort({ createdAt: -1 });
//   if (!latest) throw new Error('No onboarding data found');

//   const files = req.files as Express.Multer.File[];
//   const updates: IUpdateImage[] = JSON.parse(req.body.updates || '[]');

//   const updatedImages = await Promise.all(
//     latest.images.map(async (img) => {
//       const update = updates.find(u => u.key === img.key);

//       if (!update) return img; // no update for this image

//       let newFileData = { id: img.id, url: img.url };

//       // Replace file if uploaded
//       if (update.filename) {
//         const file = files.find(f => f.originalname === update.filename);
//         if (file) {
//           newFileData = await uploadToS3(file, 'onboarding/');
//         }
//       }

//       return {
//         id: newFileData.id,
//         url: newFileData.url,
//         key: img.key, // preserve logical key
//         title: update.title ?? img.title,          // TypeScript safe
//         description: update.description ?? img.description,
//       };
//     })
//   );

//   latest.images = updatedImages;
//   await latest.save();

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Onboarding images updated successfully',
//     data: latest,
//   });
// });
// Always return the latest
export const updateOnboardingImages = catchAsync(async (req: Request, res: Response) => {
  const latest = await Onboarding.findOne().sort({ createdAt: -1 });
  if (!latest) throw new Error('No onboarding data found');

  const files = req.files as Express.Multer.File[];
  const updates: IUpdateImage[] = JSON.parse(req.body.updates || '[]');

  const updatedImages = await Promise.all(
    latest.images.map(async (img, index) => {
      const update = updates.find(u => u.key === img.key);

      if (!update) return img; // no update

      let newFileData = { id: img.id, url: img.url };

      // Replace file if uploaded: use index based matching
      const file = files[index];
      if (file) {
        newFileData = await uploadToS3(file, 'onboarding/');
      }

      return {
        id: newFileData.id,
        url: newFileData.url,
        key: img.key,
        title: update.title ?? img.title,
        description: update.description ?? img.description,
      };
    })
  );

  latest.images = updatedImages;
  await latest.save();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Onboarding images updated successfully',
    data: latest,
  });
});

const getOnboardingImages = catchAsync(async (req: Request, res: Response) => {
  const result = await Onboarding.findOne().sort({ createdAt: -1 }); 
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
