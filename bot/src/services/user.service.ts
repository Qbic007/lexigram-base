import axios from 'axios';

interface IUser {
  telegramId: string;
  username: string;
  languages: string[];
  schedule: {
    frequency: string;
    times: string[];
  };
}

export class UserService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.USER_SERVICE_URL || 'http://localhost:3000';
  }

  async createUser(telegramId: string, username: string): Promise<IUser> {
    const response = await axios.post<IUser>(`${this.baseUrl}/api/users`, {
      telegramId,
      username,
      languages: [],
      schedule: {
        frequency: 'daily',
        times: []
      }
    });
    return response.data;
  }

  async getUser(telegramId: string): Promise<IUser> {
    const response = await axios.get<IUser>(`${this.baseUrl}/api/users/${telegramId}`);
    return response.data;
  }

  async updateUserLanguages(telegramId: string, languages: string[]): Promise<IUser> {
    const response = await axios.put<IUser>(`${this.baseUrl}/api/users/${telegramId}/languages`, {
      languages
    });
    return response.data;
  }

  async updateUserSchedule(telegramId: string, schedule: { frequency: string; times: string[] }): Promise<IUser> {
    const response = await axios.put<IUser>(`${this.baseUrl}/api/users/${telegramId}/schedule`, {
      schedule
    });
    return response.data;
  }
} 