import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import path from 'path';
import { TranslationService } from './services/translation.service';

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Проверяем наличие токена
if (!process.env.BOT_TOKEN) {
  console.error('Error: BOT_TOKEN is not set in .env file');
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Создаем экземпляр сервиса перевода
const translationService = TranslationService.getInstance();

// Обработчик команды /start
bot.start(async (ctx) => {
  console.log('Received /start command');
  await ctx.reply(
    'Привет! Я бот для изучения иностранных языков.\n\n' +
    'Просто отправь мне любое слово, и я переведу его для тебя.'
  );
});

// Обработчик текстовых сообщений
bot.on('text', async (ctx) => {
  console.log('Received text message:', ctx.message.text);
  const word = ctx.message.text;
  
  try {
    const translation = await translationService.translateWord(word);
    await ctx.reply(`Перевод слова "${word}":\n\n${translation}`);
  } catch (error) {
    console.error('Error processing word:', error);
    await ctx.reply('Извините, произошла ошибка при обработке слова.');
  }
});

// Запускаем бота
bot.launch()
  .then(() => {
    console.log('Bot started successfully!');
  })
  .catch((error) => {
    console.error('Error starting bot:', error);
    process.exit(1);
  });

// Включаем graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 