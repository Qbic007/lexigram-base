import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

if (!process.env.TRANSLATION_SERVICE_URL) {
  throw new Error('TRANSLATION_SERVICE_URL is not set in .env file');
}

export class TranslationService {
  private static instance: TranslationService;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.TRANSLATION_SERVICE_URL!;
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  public async translateWord(word: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/translate`, { word });
      return response.data.translation;
    } catch (error) {
      console.error('Error translating word:', error);
      throw new Error('Failed to translate word');
    }
  }
} 