import { Router } from 'express';
import { DictionaryController } from '../controllers/dictionary.controller';

const router = Router();
const dictionaryController = new DictionaryController();

router.post('/:userId/words', dictionaryController.addWord.bind(dictionaryController));
router.get('/:userId/words', dictionaryController.getUserDictionary.bind(dictionaryController));
router.put('/:userId/words/:wordId', dictionaryController.updateWord.bind(dictionaryController));
router.delete('/:userId/words/:wordId', dictionaryController.deleteWord.bind(dictionaryController));

export default router; 