import { z } from 'zod';

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});
const loginZodSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
  }),
});
const deleteAccountZodSchema = z.object({
  body: z.object({
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});
export const authValidation = {
  refreshTokenValidationSchema,
  loginZodSchema,
  deleteAccountZodSchema,
};
