import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  telegramId: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  telegramId: { type: Number, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', userSchema); 