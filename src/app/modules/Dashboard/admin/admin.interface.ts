// import { Model, Document } from 'mongoose';

// export type TAdmin = {
//   email: string;
//   password: string;
//   fullName: string;
//   role: 'admin' | 'super_admin';
//   isActive?: boolean;
// };

// export interface TAdminDoc extends TAdmin, Document {
//   isPasswordMatched(password: string): Promise<boolean>;
// }

// export interface AdminModel extends Model<TAdminDoc> {
//   isAdminExist(email: string): Promise<TAdminDoc | null>;
// }
import { Document, Model } from 'mongoose';

// Base admin type (without Mongoose-specific stuff)
export type TAdmin = {
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'super_admin';
  isActive?: boolean;
};

// Document with methods (Mongoose document)
export interface TAdminDoc extends TAdmin, Document {
  isPasswordMatched(password: string): Promise<boolean>;
}

// Static methods on model (Mongoose model)
export interface AdminModel extends Model<TAdminDoc> {
  isAdminExist(email: string): Promise<TAdminDoc | null>;
}
