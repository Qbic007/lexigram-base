import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if (!process.env.USER_SERVICE_URL) {
  throw new Error('USER_SERVICE_URL is not set in .env file');
}

export class DictionaryService {
  private static instance: DictionaryService;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL!;
  }

  public static getInstance(): DictionaryService {
    if (!DictionaryService.instance) {
      DictionaryService.instance = new DictionaryService();
    }
    return DictionaryService.instance;
  }

  public async addWordToDictionary(userId: number, word: string, translation: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/users/${userId}/dictionary`, {
        word,
        translation
      });
    } catch (error) {
      console.error('Error adding word to dictionary:', error);
      throw new Error('Failed to add word to dictionary');
    }
  }
} 