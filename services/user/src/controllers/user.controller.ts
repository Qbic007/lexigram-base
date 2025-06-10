import { Request, Response } from 'express';
import { User } from '../models/user.model';

export const addWordToDictionary = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { word, translation } = req.body;

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.dictionary.push({ word, translation });
    await user.save();

    res.status(200).json({ message: 'Word added to dictionary' });
  } catch (error) {
    console.error('Error adding word to dictionary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserDictionary = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ dictionary: user.dictionary });
  } catch (error) {
    console.error('Error getting user dictionary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateWord = async (req: Request, res: Response) => {
  try {
    const { userId, wordId } = req.params;
    const { word, translation } = req.body;

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wordIndex = user.dictionary.findIndex((w: any) => w._id && w._id.toString() === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ message: 'Word not found' });
    }

    user.dictionary[wordIndex] = { ...user.dictionary[wordIndex], word, translation };
    await user.save();

    res.status(200).json({ message: 'Word updated successfully' });
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteWord = async (req: Request, res: Response) => {
  try {
    const { userId, wordId } = req.params;

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wordIndex = user.dictionary.findIndex((w: any) => w._id && w._id.toString() === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ message: 'Word not found' });
    }

    user.dictionary.splice(wordIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Error deleting word:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 