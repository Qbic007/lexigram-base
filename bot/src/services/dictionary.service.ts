import axios from 'axios';

const DICTIONARY_SERVICE_URL = process.env.DICTIONARY_SERVICE_URL || 'http://dictionary-service:3002';

export class DictionaryService {
  private readonly baseUrl: string;

  public constructor() {
    this.baseUrl = DICTIONARY_SERVICE_URL;
  }

  public async addWord(userId: number, word: string, translation: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/api/dictionary/${userId}/words`, {
        word,
        translation
      });
    } catch (error) {
      console.error('Error adding word to dictionary:', error);
      throw error;
    }
  }

  public async getUserDictionary(userId: number): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/dictionary/${userId}/words`);
      return response.data.words || [];
    } catch (error) {
      console.error('Error getting user dictionary:', error);
      throw error;
    }
  }

  public async updateWord(userId: number, wordId: string, word: string, translation: string): Promise<void> {
    try {
      await axios.put(`${this.baseUrl}/api/dictionary/${userId}/words/${wordId}`, {
        word,
        translation
      });
    } catch (error) {
      console.error('Error updating word:', error);
      throw error;
    }
  }

  public async deleteWord(userId: number, wordId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/api/dictionary/${userId}/words/${wordId}`);
    } catch (error) {
      console.error('Error deleting word:', error);
      throw error;
    }
  }
} 