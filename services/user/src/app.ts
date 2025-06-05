import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Подключение к MongoDB (кроме тестовой среды)
if (process.env.NODE_ENV !== 'test') {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/lexigram_users';
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
}

// Подключение маршрутов
app.use('/api/users', userRoutes);

// Базовый роут
app.get('/', (req, res) => {
  res.send('User Service is running');
});

export default app;

// Запуск сервера, если не в тестах
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`User Service listening on port ${PORT}`);
  });
} 