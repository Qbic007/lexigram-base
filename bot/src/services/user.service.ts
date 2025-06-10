import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3000';

export class UserService {
  async createUser(telegramId: number): Promise<void> {
    try {
      await axios.post(`${USER_SERVICE_URL}/api/users`, { telegramId });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(telegramId: number): Promise<any> {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/${telegramId}`);
      return response.data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }
} 