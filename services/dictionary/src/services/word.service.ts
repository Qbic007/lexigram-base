import { Word, IWord } from '../models/word.model';
import axios from 'axios';

interface IUser {
  telegramId: string;
  username: string;
  languages: string[];
  schedule: {
    frequency: string;
    times: string[];
  };
}

export class WordService {
  private readonly userServiceUrl: string;

  constructor() {
    this.userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3000';
  }

  private async validateUserAndLanguage(userId: string, languageId: string): Promise<void> {
    try {
      const response = await axios.get<IUser>(`${this.userServiceUrl}/api/users/${userId}`);
      const user = response.data;
      
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.languages.includes(languageId)) {
        throw new Error('Language is not in user\'s language list');
      }
    } catch (error) {
      const err = error as any;
      if (err?.response?.status === 404) {
        throw new Error('User not found');
      }
      throw error;
    }
  }

  async addWord(wordData: Partial<IWord>): Promise<IWord> {
    await this.validateUserAndLanguage(wordData.userId!, wordData.languageId!);
    const word = new Word(wordData);
    return word.save();
  }

  async getWordsByUser(userId: string, languageId: string): Promise<IWord[]> {
    await this.validateUserAndLanguage(userId, languageId);
    return Word.find({ userId, languageId }).sort({ addedAt: -1 });
  }

  async updateWordStatus(wordId: string, status: 'new' | 'learning' | 'learned'): Promise<IWord | null> {
    const word = await Word.findById(wordId);
    if (!word) {
      throw new Error('Word not found');
    }
    await this.validateUserAndLanguage(word.userId, word.languageId);
    return Word.findByIdAndUpdate(wordId, { status }, { new: true });
  }

  async deleteWord(wordId: string): Promise<void> {
    const word = await Word.findById(wordId);
    if (!word) {
      throw new Error('Word not found');
    }
    await this.validateUserAndLanguage(word.userId, word.languageId);
    await Word.findByIdAndDelete(wordId);
  }

  async getWordsByStatus(userId: string, languageId: string, status: 'new' | 'learning' | 'learned'): Promise<IWord[]> {
    await this.validateUserAndLanguage(userId, languageId);
    return Word.find({ userId, languageId, status }).sort({ addedAt: -1 });
  }
} 