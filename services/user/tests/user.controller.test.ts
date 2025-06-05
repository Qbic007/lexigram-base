import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/user.model';
import { UserController } from '../src/controllers/user.controller';
import { UserService } from '../src/services/user.service';

jest.setTimeout(30000);

describe('UserController', () => {
  beforeAll(async () => {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should create a new user', async () => {
    const userData = {
      telegramId: '123456',
      username: 'testuser',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    const response = await request(app).post('/api/users').send(userData);
    expect(response.status).toBe(201);
    expect(response.body.telegramId).toBe(userData.telegramId);
    expect(response.body.username).toBe(userData.username);
  });

  it('should get user by telegramId', async () => {
    const userData = {
      telegramId: '123456',
      username: 'testuser',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    await request(app).post('/api/users').send(userData);
    const response = await request(app).get(`/api/users/${userData.telegramId}`);
    expect(response.status).toBe(200);
    expect(response.body.telegramId).toBe(userData.telegramId);
  });

  it('should update user', async () => {
    const userData = {
      telegramId: '123456',
      username: 'testuser',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    await request(app).post('/api/users').send(userData);
    const updatedData = { username: 'updateduser' };
    const response = await request(app).put(`/api/users/${userData.telegramId}`).send(updatedData);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(updatedData.username);
  });

  it('should delete user', async () => {
    const userData = {
      telegramId: '123456',
      username: 'testuser',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    await request(app).post('/api/users').send(userData);
    const response = await request(app).delete(`/api/users/${userData.telegramId}`);
    expect(response.status).toBe(204);
    const getResponse = await request(app).get(`/api/users/${userData.telegramId}`);
    expect(getResponse.status).toBe(404);
  });

  it('should get all users', async () => {
    const userData1 = {
      telegramId: '123456',
      username: 'testuser1',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    const userData2 = {
      telegramId: '789012',
      username: 'testuser2',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    await request(app).post('/api/users').send(userData1);
    await request(app).post('/api/users').send(userData2);
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
}); 