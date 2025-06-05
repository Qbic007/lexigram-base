import { Request, Response } from 'express';
import { Word } from '../models/word.model';

export class WordController {
  async addWord(req: Request, res: Response) {
    try {
      const word = new Word(req.body);
      await word.save();
      res.status(201).json(word);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getWordsByUser(req: Request, res: Response) {
    try {
      const { userId, languageId } = req.params;
      const words = await Word.find({ userId, languageId }).sort({ addedAt: -1 });
      res.status(200).json(words);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async updateWordStatus(req: Request, res: Response) {
    try {
      const { wordId } = req.params;
      const { status } = req.body;
      const word = await Word.findByIdAndUpdate(wordId, { status }, { new: true });
      if (!word) {
        return res.status(404).json({ error: 'Word not found' });
      }
      res.status(200).json(word);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async deleteWord(req: Request, res: Response) {
    try {
      const { wordId } = req.params;
      const word = await Word.findByIdAndDelete(wordId);
      if (!word) {
        return res.status(404).json({ error: 'Word not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getWordsByStatus(req: Request, res: Response) {
    try {
      const { userId, languageId, status } = req.params;
      const words = await Word.find({ userId, languageId, status }).sort({ addedAt: -1 });
      res.status(200).json(words);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
} 