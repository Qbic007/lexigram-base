import axios from 'axios';

const TRANSLATION_SERVICE_URL = process.env.TRANSLATION_SERVICE_URL || 'http://translation-service:3001';

export class TranslationService {
  async translate(text: string): Promise<string> {
    try {
      const response = await axios.post(`${TRANSLATION_SERVICE_URL}/translate`, { word: text });
      return response.data.translation;
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }
} 