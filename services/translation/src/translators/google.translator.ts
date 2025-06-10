import axios from 'axios';
import { Translator } from './translator.interface';

export class GoogleTranslator implements Translator {
  private readonly url = 'https://translate.googleapis.com/translate_a/single';

  async translate(word: string): Promise<string | null> {
    try {
      const response = await axios.get(this.url, {
        params: {
          client: 'gtx',
          sl: 'en',
          tl: 'ru',
          dt: 't',
          q: word
        }
      });
      
      if (response.data && response.data[0] && response.data[0][0] && response.data[0][0][0]) {
        return response.data[0][0][0];
      }
      return null;
    } catch (error) {
      console.error('Ошибка при переводе через Google:', error);
      return null;
    }
  }

  getName(): string {
    return 'Google Translate';
  }
} 