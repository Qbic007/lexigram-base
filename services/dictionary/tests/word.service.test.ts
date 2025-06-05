import mongoose from 'mongoose';
import { WordService } from '../src/services/word.service';
import { Word, IWord } from '../src/models/word.model';
import dotenv from 'dotenv';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

dotenv.config();

describe('WordService', () => {
  let service: WordService;

  beforeAll(async () => {
    const user = process.env.MONGO_USER;
    const pass = process.env.MONGO_PASS;
    const host = process.env.MONGO_HOST;
    const port = process.env.MONGO_PORT;
    const db = process.env.MONGO_DB;
    const uri = `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;
    await mongoose.connect(uri);
    service = new WordService();
  }, 10000);

  afterAll(async () => {
    await Word.deleteMany({});
    await mongoose.disconnect();
  }, 10000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a word when user exists and language is valid', async () => {
    // Мокаем ответ от User Service
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        telegramId: 'user1',
        username: 'testuser',
        languages: ['en'],
        schedule: {
          frequency: 'daily',
          times: []
        }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    const wordData = {
      userId: 'user1',
      languageId: 'en',
      original: 'hello',
      translation: 'привет',
      status: 'new',
      addedAt: new Date()
    } as IWord;
    const word = await service.addWord(wordData);
    expect(word).toHaveProperty('_id');
    expect(word.original).toBe('hello');
  });

  it('should throw error when user does not exist', async () => {
    // Мокаем 404 ошибку от User Service
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 404 }
    });

    const wordData = {
      userId: 'nonexistent',
      languageId: 'en',
      original: 'hello',
      translation: 'привет'
    } as IWord;

    await expect(service.addWord(wordData)).rejects.toThrow('User not found');
  });

  it('should throw error when language is not in user\'s list', async () => {
    // Мокаем ответ от User Service с другим языком
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        telegramId: 'user1',
        username: 'testuser',
        languages: ['fr'], // Пользователь изучает французский, а не английский
        schedule: {
          frequency: 'daily',
          times: []
        }
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    const wordData = {
      userId: 'user1',
      languageId: 'en',
      original: 'hello',
      translation: 'привет'
    } as IWord;

    await expect(service.addWord(wordData)).rejects.toThrow('Language is not in user\'s language list');
  });
}); 