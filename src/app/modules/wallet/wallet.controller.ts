import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadManyToS3, uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import walletService from './wallet.service';
import { generateAIImage } from '../../utils/aiImageGenerator';
import { uploadFromUrlToS3 } from '../../utils/uploadFromUrlToS3';

const insertTextToWallet = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await walletService.insertTextToWallet({
    note: { ...req.body },
    user: userId,
    type: 'text',
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Note added successfully',
    data: result,
  });
});
const insertAudioToWallet = catchAsync(async (req: Request, res: Response) => {
  let voice;
  if (req?.file) {
    voice = await uploadToS3(req?.file, 'voice/');
  }
  const data = {
    title: req.body.title,
    voiceLink: voice,
  };

  const { userId } = req.user;
  const result = await walletService.insertAudioToWallet({
    ...req.body,
    user: userId,
    type: 'voice',
    voice: data,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'A successfully',
    data: result,
  });
});
// const insertAiImageToWallet = catchAsync(
//   async (req: Request, res: Response) => {
//     let image;
//     if (req?.file) {
//       image = await uploadToS3(req?.file, 'wallet/aiImage/');
//     }
//     const { userId } = req.user;
//     const result = await walletService.insertAiImageToWallet({
//       ...req.body,
//       user: userId,
//       type: 'ai_generate',
//       aiGenerate: image,
//     });
//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: 'A successfully',
//       data: result,
//     });
//   },
// );

const insertAiImageToWallet = catchAsync(
  async (req: Request, res: Response) => {
    const { prompt } = req.body;
    const { userId } = req.user;

    if (!prompt) {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: 'Prompt is required',
        data: null,
      });
    }

    const openaiImageUrl = await generateAIImage(prompt);
    // const s3ImageUrl = await uploadFromUrlToS3(
    //   openaiImageUrl,
    //   'wallet/aiImage/',
    // );

    // const result = await walletService.insertAiImageToWallet({
    //   user: userId,
    //   type: 'ai_generate',
    //   prompt,
    //   aiGenerate: s3ImageUrl,
    // });
    const s3Image = await uploadFromUrlToS3(openaiImageUrl, 'wallet/aiImage/');

    const result = await walletService.insertAiImageToWallet({
      user: userId,
      type: 'ai_generate',
      prompt,
      aiGenerate: {
        id: s3Image.id,
        url: s3Image.url,
      }, // ✅ Now passing object
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'AI image generated and saved successfully',
      data: {
        prompt,
        openaiImageUrl,
        s3ImageUrl: s3Image.url,
        saved: result,
      },
    });
  },
);

// const insertVideosOrImagesToWallet = catchAsync(
//   async (req: Request, res: Response) => {
//     let images: { url: string; id: string }[] = [];
//     let videos: { url: string; id: string }[] = [];

//     if (req?.files) {
//       const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//       if (files?.images) {
//         images = await uploadManyToS3(
//           files.images.map((file) => ({
//             file,
//             path: 'wallet/images/',
//           })),
//         );
//       }

//       if (files?.videos) {
//         videos = await uploadManyToS3(
//           files.videos.map((file) => ({
//             file,
//             path: 'wallet/videos/',
//           })),
//         );
//       }
//     }

//     const payload: any = {
//       ...req.body,
//       images,
//       videos,
//     };

//     const result = await walletService.insertAiImageToWallet(payload);
//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: 'Data inserted successfully',
//       data: result,
//     });
//   },
// );
const insertVideosOrImagesToWallet = catchAsync(
  async (req: Request, res: Response) => {
    let images: { url: string; id: string }[] = [];
    let videos: { url: string; id: string }[] = [];

    if (req?.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files?.images) {
        images = await uploadManyToS3(
          files.images.map((file) => ({
            file,
            path: 'wallet/images/',
          })),
        );
      }

      if (files?.videos) {
        videos = await uploadManyToS3(
          files.videos.map((file) => ({
            file,
            path: 'wallet/videos/',
          })),
        );
      }
    }

    const { userId } = req.user; // ✅ Get user ID from auth middleware

    const payload: any = {
      user: userId, // ✅ REQUIRED
      type: 'image_video', // ✅ REQUIRED, matches Mongoose schema
      imageVideo: {
        title: req.body.title,
        description: req.body.description,
        images,
        videos,
      },
    };

    const result = await walletService.insertAiImageToWallet(payload); // 🧠 You may want to rename this service to `insertImageVideoToWallet`
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Data inserted successfully',
      data: result,
    });
  },
);

const getMyWalletData = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  const result = await walletService.getMyWalletData({
    ...req.query,
    user: userId,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wallet data retrieved successfully',
    data: result.data,
    meta: result?.meta,
  });
});
const deleteWalletData = catchAsync(async (req: Request, res: Response) => {
  const result = await walletService.deleteWalletData(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Wallet data deleted successfully',
    data: result,
  });
});

const walletController = {
  insertTextToWallet,
  insertAudioToWallet,
  insertAiImageToWallet,
  insertVideosOrImagesToWallet,
  getMyWalletData,
  deleteWalletData,
};

export default walletController;
