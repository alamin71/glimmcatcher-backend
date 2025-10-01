
import { Schema, model } from 'mongoose';
interface IOnboardingImage {
  id: string;        // S3 file id
  url: string;       // S3 URL
  key: string;       // logical id (img1, img2, img3)
  title: string;
  description: string;
}

interface IOnboarding {
  images: IOnboardingImage[];
}

const onboardingSchema = new Schema<IOnboarding>({
  images: [
    {
      id: { type: String, required: true },
      url: { type: String, required: true },
      key: { type: String, required: true }, // new field
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
}, { timestamps: true });
export const Onboarding = model<IOnboarding>('Onboarding', onboardingSchema);