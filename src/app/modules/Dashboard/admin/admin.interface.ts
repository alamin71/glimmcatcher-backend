import { Model, Document } from 'mongoose';

export type TAdmin = {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'super_admin';
  isActive?: boolean;
};

export interface TAdminDoc extends TAdmin, Document {
  isPasswordMatched(password: string): Promise<boolean>;
}

export interface AdminModel extends Model<TAdminDoc> {
  isAdminExist(email: string): Promise<TAdminDoc | null>;
}
