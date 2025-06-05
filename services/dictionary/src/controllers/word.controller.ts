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
} 