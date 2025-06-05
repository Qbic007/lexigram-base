import axios from 'axios';

interface IWord {
  userId: string;
  languageId: string;
  original: string;
  translation: string;
  status: 'new' | 'learning' | 'learned';
  addedAt: Date;
}

export class DictionaryService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DICTIONARY_SERVICE_URL || 'http://localhost:3001';
  }

  async addWord(wordData: Partial<IWord>): Promise<IWord> {
    const response = await axios.post<IWord>(`${this.baseUrl}/api/words`, wordData);
    return response.data;
  }

  async getWordsByUser(userId: string, languageId: string): Promise<IWord[]> {
    const response = await axios.get<IWord[]>(`${this.baseUrl}/api/words/${userId}/${languageId}`);
    return response.data;
  }

  async updateWordStatus(wordId: string, status: 'new' | 'learning' | 'learned'): Promise<IWord> {
    const response = await axios.put<IWord>(`${this.baseUrl}/api/words/${wordId}/status`, { status });
    return response.data;
  }

  async deleteWord(wordId: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/api/words/${wordId}`);
  }

  async getWordsByStatus(userId: string, languageId: string, status: 'new' | 'learning' | 'learned'): Promise<IWord[]> {
    const response = await axios.get<IWord[]>(`${this.baseUrl}/api/words/${userId}/${languageId}/${status}`);
    return response.data;
  }
} 