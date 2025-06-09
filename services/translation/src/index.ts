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

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Эндпоинт для перевода
app.post('/translate', async (req, res) => {
  try {
    const { word } = req.body;
    console.log(`Translating word: "${word}"`);

    const response = await axios.get(MYMEMORY_API_URL, {
      params: {
        q: word,
        langpair: 'en|ru'
      }
    });

    console.log('Translation response:', response.data);
    
    if (response.data.responseStatus === 200 && response.data.responseData.translatedText) {
      const translation = response.data.responseData.translatedText;
      console.log('Translation result:', translation);
      res.json({ translation });
    } else {
      throw new Error('Invalid response from translation service');
    }
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

app.listen(port, () => {
  console.log(`Translation service is running on port ${port}`);
}); 