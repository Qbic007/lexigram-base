import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { WordController } from '../src/controllers/word.controller';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
const wordController = new WordController();

// Подключаем все маршруты
app.post('/words', wordController.addWord.bind(wordController));
app.get('/words/:userId/:languageId', wordController.getWordsByUser.bind(wordController));
app.put('/words/:wordId/status', wordController.updateWordStatus.bind(wordController));
app.delete('/words/:wordId', wordController.deleteWord.bind(wordController));
app.get('/words/:userId/:languageId/:status', wordController.getWordsByStatus.bind(wordController));

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

describe('GET /words/:userId/:languageId', () => {
  it('should get words by user and language', async () => {
    const res = await request(app)
      .get('/words/user2/en');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /words/:wordId/status', () => {
  it('should update word status', async () => {
    // Сначала создаем слово
    const createRes = await request(app)
      .post('/words')
      .send({
        userId: 'user3',
        languageId: 'en',
        original: 'hello',
        translation: 'привет',
        status: 'new'
      });
    const wordId = createRes.body._id;

    // Обновляем статус
    const updateRes = await request(app)
      .put(`/words/${wordId}/status`)
      .send({ status: 'learning' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.status).toBe('learning');
  });
});

describe('DELETE /words/:wordId', () => {
  it('should delete a word', async () => {
    // Сначала создаем слово
    const createRes = await request(app)
      .post('/words')
      .send({
        userId: 'user4',
        languageId: 'en',
        original: 'goodbye',
        translation: 'до свидания',
        status: 'new'
      });
    const wordId = createRes.body._id;

    // Удаляем слово
    const deleteRes = await request(app)
      .delete(`/words/${wordId}`);
    expect(deleteRes.statusCode).toBe(204);

    // Проверяем, что слово удалено
    const getRes = await request(app)
      .get(`/words/user4/en`);
    expect(getRes.body.length).toBe(0);
  });
});

describe('GET /words/:userId/:languageId/:status', () => {
  it('should get words by status', async () => {
    // Сначала создаем слово с определенным статусом
    await request(app)
      .post('/words')
      .send({
        userId: 'user5',
        languageId: 'en',
        original: 'test',
        translation: 'тест',
        status: 'new'
      });

    // Получаем слова по статусу
    const res = await request(app)
      .get('/words/user5/en/new');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].status).toBe('new');
  });
}); 