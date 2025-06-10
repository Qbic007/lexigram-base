import { Request, Response } from 'express';
import { User } from '../models/user.model';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.body;

    const existingUser = await User.findOne({ telegramId });
    if (existingUser) {
      return res.status(200).json({ message: 'User already exists' });
    }

    const user = new User({ telegramId });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 