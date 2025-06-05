import { Word, IWord } from '../models/word.model';
import { Document } from 'mongoose';

export class WordService {
  async addWord(wordData: Omit<IWord, keyof Document>): Promise<IWord> {
    const word = new Word(wordData);
    return await word.save();
  }

  async getWordsByUser(userId: string, languageId: string): Promise<IWord[]> {
    return await Word.find({ userId, languageId }).sort({ addedAt: -1 });
  }

  async updateWordStatus(wordId: string, status: IWord['status']): Promise<IWord | null> {
    return await Word.findByIdAndUpdate(
      wordId,
      { status },
      { new: true }
    );
  }

  async deleteWord(wordId: string): Promise<IWord | null> {
    return await Word.findByIdAndDelete(wordId);
  }

  async getWordsByStatus(userId: string, languageId: string, status: IWord['status']): Promise<IWord[]> {
    return await Word.find({ userId, languageId, status }).sort({ addedAt: -1 });
  }
} 