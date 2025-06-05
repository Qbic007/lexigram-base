import mongoose from 'mongoose';
import { WordService } from '../src/services/word.service';
import { Word, IWord } from '../src/models/word.model';
import dotenv from 'dotenv';

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

  it('should add a word', async () => {
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
}); 