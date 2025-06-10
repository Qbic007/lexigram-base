import { Router } from 'express';
import { addWordToDictionary } from '../controllers/user.controller';

const router = Router();

router.post('/:userId/dictionary', addWordToDictionary);

export default router; 