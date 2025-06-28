import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../../config/index';
import { TAdmin, TAdminDoc, AdminModel } from './admin.interface';

const AdminSchema = new Schema<TAdminDoc>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'super_admin'], required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

// ✅ Password hash before save
AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// ✅ Define static method with proper type
AdminSchema.statics.isAdminExist = function (email: string) {
  return this.findOne({ email }).select('+password');
};

// ✅ Use correct model typing: <DocumentType, ModelType>
export const Admin = model<TAdminDoc, AdminModel>('Admin', AdminSchema);
