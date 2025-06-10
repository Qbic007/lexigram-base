import { Request, Response } from 'express';
import { DictionaryModel } from '../models/dictionary.model';

export class DictionaryController {
  async addWord(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { word, translation } = req.body;

      const dictionary = await DictionaryModel.findOne({ userId });
      if (!dictionary) {
        const newDictionary = new DictionaryModel({
          userId,
          words: [{ word, translation }]
        });
        await newDictionary.save();
        return res.status(201).json(newDictionary);
      }

      dictionary.words.push({ word, translation });
      await dictionary.save();
      res.status(200).json(dictionary);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Произошла неизвестная ошибка' });
      }
    }
  }

  async getUserDictionary(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const dictionary = await DictionaryModel.findOne({ userId });
      if (!dictionary) {
        return res.status(404).json({ message: 'Словарь не найден' });
      }
      res.status(200).json(dictionary);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Произошла неизвестная ошибка' });
      }
    }
  }

  async updateWord(req: Request, res: Response) {
    try {
      const { userId, wordId } = req.params;
      const { word, translation } = req.body;

      const dictionary = await DictionaryModel.findOne({ userId });
      if (!dictionary) {
        return res.status(404).json({ message: 'Словарь не найден' });
      }

      const wordIndex = dictionary.words.findIndex((w: any) => w._id.toString() === wordId);
      if (wordIndex === -1) {
        return res.status(404).json({ message: 'Слово не найдено' });
      }

      dictionary.words[wordIndex].word = word;
      dictionary.words[wordIndex].translation = translation;
      await dictionary.save();
      res.status(200).json(dictionary);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Произошла неизвестная ошибка' });
      }
    }
  }

  async deleteWord(req: Request, res: Response) {
    try {
      const { userId, wordId } = req.params;

      const dictionary = await DictionaryModel.findOne({ userId });
      if (!dictionary) {
        return res.status(404).json({ message: 'Словарь не найден' });
      }

      dictionary.words = dictionary.words.filter((w: any) => w._id.toString() !== wordId);
      await dictionary.save();
      res.status(200).json(dictionary);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Произошла неизвестная ошибка' });
      }
    }
  }
} 