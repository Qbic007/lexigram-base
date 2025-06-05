import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  telegramId: string;
  username: string;
  schedule: {
    frequency: string;
    times: string[];
  };
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  schedule: {
    frequency: { type: String, default: 'daily' },
    times: { type: [String], default: [] }
  },
  languages: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema); 