import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.TRANSLATION_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());

const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Функция для перевода через Google Translate
async function translateWithGoogle(word: string): Promise<string | null> {
  try {
    const response = await axios.get(GOOGLE_TRANSLATE_URL, {
      params: {
        client: 'gtx',
        sl: 'en',
        tl: 'ru',
        dt: 't',
        q: word
      }
    });
    
    if (response.data && response.data[0] && response.data[0][0] && response.data[0][0][0]) {
      return response.data[0][0][0];
    }
    return null;
  } catch (error) {
    console.error('Ошибка при переводе через Google:', error);
    return null;
  }
}

// Функция для перевода через MyMemory
async function translateWithMyMemory(word: string): Promise<string | null> {
  try {
    const response = await axios.get(MYMEMORY_API_URL, {
      params: {
        q: word,
        langpair: 'en|ru'
      }
    });

    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
      return response.data.responseData.translatedText;
    }
    return null;
  } catch (error) {
    console.error('Ошибка при переводе через MyMemory:', error);
    return null;
  }
}

// Эндпоинт для перевода
app.post('/translate', async (req, res) => {
  const { word } = req.body;
  
  if (!word) {
    return res.status(400).json({ error: 'Слово не указано' });
  }

  console.log(`Перевод слова: ${word}`);

  try {
    // Сначала пробуем Google Translate
    let translation = await translateWithGoogle(word);
    
    // Если Google Translate не сработал, пробуем MyMemory
    if (!translation) {
      console.log('Google Translate не сработал, пробуем MyMemory');
      translation = await translateWithMyMemory(word);
    }

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

app.listen(port, () => {
  console.log(`Сервис перевода запущен на порту ${port}`);
}); 