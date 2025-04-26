import { Types } from 'mongoose';

export type WalletType = 'text' | 'voice' | 'image_video' | 'ai_generate';

export interface IImageOrVideo {
  id: number;
  url: string;
}

export interface IText {
  title?: string;
  description?: string;
}

export interface IVoice {
  title?: string;
  voiceLink?: string;
}

export interface IImageVideo {
  title?: string;
  description?: string;
  imagesOrVideos?: IImageOrVideo[];
}

export interface IAiGenerate {
  image?: IImageOrVideo;
}

export interface IWallet {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  type: WalletType;
  text?: IText;
  voice?: IVoice;
  imageVideo?: IImageVideo;
  aiGenerate?: IAiGenerate;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
