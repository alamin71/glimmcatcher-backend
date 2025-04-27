import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadManyToS3, uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import walletService from './wallet.service';

const insertTextToWallet = catchAsync(async (req: Request, res: Response) => {
  const result = await walletService.insertTextToWallet(req.body);
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
  const result = await walletService.insertAudioToWallet({
    ...req.body,
    voice,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'A successfully',
    data: result,
  });
});
const insertAiImageToWallet = catchAsync(
  async (req: Request, res: Response) => {
    let image;
    if (req?.file) {
      image = await uploadToS3(req?.file, 'wallet/aiImage/');
    }
    const result = await walletService.insertAiImageToWallet({
      ...req.body,
      aiGenerate: image,
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'A successfully',
      data: result,
    });
  },
);
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

    const payload: any = {
      ...req.body,
      images,
      videos,
    };

    const result = await walletService.insertAiImageToWallet(payload);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'A successfully',
      data: result,
    });
  },
);

const walletController = {
  insertTextToWallet,
  insertAudioToWallet,
  insertAiImageToWallet,
  insertVideosOrImagesToWallet,
};

export default walletController;
