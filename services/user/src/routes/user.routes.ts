import { Router } from 'express';
import { addWordToDictionary, getUserDictionary } from '../controllers/user.controller';

const router = Router();

router.post('/:userId/dictionary', addWordToDictionary);
router.get('/:userId/dictionary', getUserDictionary);

export default router; 