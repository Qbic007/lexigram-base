import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import { UserService } from '../src/services/user.service';
import User from '../src/models/user.model';

jest.setTimeout(30000);

describe('UserService', () => {
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
    const user = await new UserService().createUser(userData);
    expect(user.telegramId).toBe(userData.telegramId);
    expect(user.username).toBe(userData.username);
  });

  it('should get user by telegramId', async () => {
    const userData = {
      telegramId: '123456',
      username: 'testuser',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    await new UserService().createUser(userData);
    const user = await new UserService().getUserByTelegramId(userData.telegramId);
    expect(user).not.toBeNull();
    expect(user?.telegramId).toBe(userData.telegramId);
  });

  it('should update user', async () => {
    const userData = {
      telegramId: '123456',
      username: 'testuser',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    await new UserService().createUser(userData);
    const updatedData = { username: 'updateduser' };
    const user = await new UserService().updateUser(userData.telegramId, updatedData);
    expect(user).not.toBeNull();
    expect(user?.username).toBe(updatedData.username);
  });

  it('should delete user', async () => {
    const userData = {
      telegramId: '123456',
      username: 'testuser',
      schedule: { frequency: 'daily', times: ['10:00'] },
      languages: ['en', 'ru']
    };
    await new UserService().createUser(userData);
    const user = await new UserService().deleteUser(userData.telegramId);
    expect(user).not.toBeNull();
    const deletedUser = await new UserService().getUserByTelegramId(userData.telegramId);
    expect(deletedUser).toBeNull();
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
    await new UserService().createUser(userData1);
    await new UserService().createUser(userData2);
    const users = await new UserService().getAllUsers();
    expect(users.length).toBe(2);
  });
}); 