import express from 'express';
import { addWordToDictionary, getUserDictionary, updateWord, deleteWord } from '../controllers/user.controller';

const router = express.Router();

router.post('/:userId/dictionary', addWordToDictionary);
router.get('/:userId/dictionary', getUserDictionary);
router.put('/:userId/dictionary/:wordId', updateWord);
router.delete('/:userId/dictionary/:wordId', deleteWord);

export default router; 