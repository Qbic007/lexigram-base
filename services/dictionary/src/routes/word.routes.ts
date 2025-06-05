import { Router } from 'express';
import { WordController } from '../controllers/word.controller';

const router = Router();
const wordController = new WordController();

router.post('/', wordController.addWord);
router.get('/:userId/:languageId', wordController.getWordsByUser);
router.put('/:wordId/status', wordController.updateWordStatus);
router.delete('/:wordId', wordController.deleteWord);
router.get('/:userId/:languageId/:status', wordController.getWordsByStatus);

export default router; 