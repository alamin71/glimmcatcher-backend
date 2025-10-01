// // src/modules/onboarding/onboarding.model.ts
// import { Schema, model } from 'mongoose';

// interface IOnboarding {
//   images: { id: string; url: string }[]; // S3 URL save 
// }

// const onboardingSchema = new Schema<IOnboarding>(
//   {
//     images: [
//       {
//         id: { type: String, required: true },
//         url: { type: String, required: true },
//       },

//     ],
//   },
//   { timestamps: true }
// );

// export const Onboarding = model<IOnboarding>('Onboarding', onboardingSchema);
// src/modules/onboarding/onboarding.model.ts
import { Schema, model } from 'mongoose';

interface IOnboarding {
  images: { 
    id: string; 
    url: string; 
    title: string; 
    description: string; 
  }[]; 
}

const onboardingSchema = new Schema<IOnboarding>(
  {
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export const Onboarding = model<IOnboarding>('Onboarding', onboardingSchema);
