import axios from 'axios';
import { Translator } from './translator.interface';

export class MyMemoryTranslator implements Translator {
  private readonly url = 'https://api.mymemory.translated.net/get';

  async translate(word: string): Promise<string | null> {
    try {
      const response = await axios.get(this.url, {
        params: {
          q: word,
          langpair: 'en|ru'
        }
      });

      if (response.data && response.data.responseData && response.data.responseData.translatedText) {
        return response.data.responseData.translatedText;
      }
      return null;
    } catch (error) {
      console.error('Ошибка при переводе через MyMemory:', error);
      return null;
    }
  }

  getName(): string {
    return 'MyMemory';
  }
} 