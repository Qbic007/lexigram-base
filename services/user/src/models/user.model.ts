import mongoose from 'mongoose';

interface IWord {
  word: string;
  translation: string;
  createdAt: Date;
}

interface IUser {
  telegramId: number;
  dictionary: IWord[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  telegramId: { type: Number, required: true, unique: true },
  dictionary: [{
    word: { type: String, required: true },
    translation: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', userSchema); 