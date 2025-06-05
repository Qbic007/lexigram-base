import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { WordController } from '../src/controllers/word.controller';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
const wordController = new WordController();
app.post('/words', wordController.addWord.bind(wordController));

beforeAll(async () => {
  const user = process.env.MONGO_USER;
  const pass = process.env.MONGO_PASS;
  const host = process.env.MONGO_HOST;
  const port = process.env.MONGO_PORT;
  const db = process.env.MONGO_DB;
  const uri = `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;
  await mongoose.connect(uri);
});
afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});

describe('POST /words', () => {
  it('should create a new word', async () => {
    const res = await request(app)
      .post('/words')
      .send({
        userId: 'user2',
        languageId: 'en',
        original: 'world',
        translation: 'мир',
        status: 'new',
        addedAt: new Date()
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.original).toBe('world');
  });
}); 