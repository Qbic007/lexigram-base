import mongoose, { Document, Schema } from 'mongoose';

interface IWord {
  word: string;
  translation: string;
  _id?: any;
}

interface IDictionary extends Document {
  userId: number;
  words: IWord[];
}

const wordSchema = new Schema<IWord>({
  word: { type: String, required: true },
  translation: { type: String, required: true }
}, { _id: true });

const dictionarySchema = new Schema<IDictionary>({
  userId: { type: Number, required: true, unique: true },
  words: [wordSchema]
});

export const DictionaryModel = mongoose.model<IDictionary>('Dictionary', dictionarySchema); 