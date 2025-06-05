import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const userController = new UserController();

// Маршруты для пользователей
router.post('/', userController.createUser);
router.get('/:telegramId', userController.getUserByTelegramId);
router.put('/:telegramId', userController.updateUser);
router.delete('/:telegramId', userController.deleteUser);
router.get('/', userController.getAllUsers);

export default router; 