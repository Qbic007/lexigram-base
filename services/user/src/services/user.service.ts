import User, { IUser } from '../models/user.model';

export class UserService {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async getUserByTelegramId(telegramId: string): Promise<IUser | null> {
    return await User.findOne({ telegramId });
  }

  async updateUser(telegramId: string, userData: Partial<IUser>): Promise<IUser | null> {
    return await User.findOneAndUpdate({ telegramId }, userData, { new: true });
  }

  async deleteUser(telegramId: string): Promise<IUser | null> {
    return await User.findOneAndDelete({ telegramId });
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find();
  }
} 