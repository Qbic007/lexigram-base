import { Request, Response } from 'express';
import { User } from '../models/user.model';

export const addWordToDictionary = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { word, translation } = req.body;

    if (!word || !translation) {
      return res.status(400).json({ error: 'Word and translation are required' });
    }

    const user = await User.findOneAndUpdate(
      { telegramId: parseInt(userId) },
      {
        $push: {
          dictionary: {
            word,
            translation
          }
        },
        $setOnInsert: {
          telegramId: parseInt(userId)
        }
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Word added to dictionary', user });
  } catch (error) {
    console.error('Error adding word to dictionary:', error);
    res.status(500).json({ error: 'Failed to add word to dictionary' });
  }
};

export const getUserDictionary = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ telegramId: parseInt(userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ dictionary: user.dictionary });
  } catch (error) {
    console.error('Error getting user dictionary:', error);
    res.status(500).json({ error: 'Failed to get user dictionary' });
  }
}; 