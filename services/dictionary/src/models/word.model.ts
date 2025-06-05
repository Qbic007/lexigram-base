import mongoose, { Document, Schema } from 'mongoose';

export interface IWord extends Document {
  userId: string;
  languageId: string;
  original: string;
  translation: string;
  addedAt: Date;
  status: 'new' | 'learning' | 'learned';
}

const wordSchema = new Schema<IWord>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  languageId: {
    type: String,
    required: true,
    index: true
  },
  original: {
    type: String,
    required: true
  },
  translation: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'learning', 'learned'],
    default: 'new'
  }
});

// Составной индекс для быстрого поиска слов пользователя на определенном языке
wordSchema.index({ userId: 1, languageId: 1 });

export const Word = mongoose.model<IWord>('Word', wordSchema); 