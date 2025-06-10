import express from 'express';
import dotenv from 'dotenv';
import { TranslationFacade } from './translators/translation.facade';

dotenv.config();

const app = express();
app.use(express.json());

const translationFacade = new TranslationFacade();

app.post('/translate', async (req, res) => {
  const { word } = req.body;
  
  if (!word) {
    return res.status(400).json({ error: 'Слово не указано' });
  }

  console.log(`Перевод слова: ${word}`);

  try {
    const translation = await translationFacade.translate(word);

    if (translation) {
      console.log(`Результат перевода: ${translation}`);
      return res.json({ translation });
    } else {
      console.error('Не удалось получить перевод ни через один сервис');
      return res.status(500).json({ error: 'Не удалось перевести слово' });
    }
  } catch (error) {
    console.error('Ошибка при переводе:', error);
    return res.status(500).json({ error: 'Ошибка при переводе слова' });
  }
});

// Эндпоинт для получения списка доступных переводчиков
app.get('/translators', (req, res) => {
  const translators = translationFacade.getAvailableTranslators();
  res.json({ translators });
});

const PORT = process.env.TRANSLATION_SERVICE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Сервис перевода запущен на порту ${PORT}`);
  console.log('Доступные переводчики:', translationFacade.getAvailableTranslators());
}); 