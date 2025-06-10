import { Telegraf, Markup, Context } from 'telegraf';
import dotenv from 'dotenv';
import path from 'path';
import { TranslationService } from './services/translation.service';
import { DictionaryService } from './services/dictionary.service';

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Проверяем наличие токена
if (!process.env.BOT_TOKEN) {
  console.error('Error: BOT_TOKEN is not set in .env file');
  process.exit(1);
}

// Создаем экземпляр бота
const bot = new Telegraf<Context>(process.env.BOT_TOKEN);

// Создаем экземпляры сервисов
const translationService = TranslationService.getInstance();
const dictionaryService = DictionaryService.getInstance();

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
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('Добавить в словарь', `add_${word}_${translation}`)
    ]);
    
    await ctx.reply(
      `Перевод слова "${word}":\n\n${translation}`,
      keyboard
    );
  } catch (error) {
    console.error('Error processing word:', error);
    await ctx.reply('Извините, произошла ошибка при обработке слова.');
  }
});

// Обработчик нажатия на кнопку
bot.action(/^add_(.+)_(.+)$/, async (ctx) => {
  const [_, word, translation] = ctx.match;
  const userId = ctx.from?.id;

  if (!userId) {
    await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
    return;
  }

  try {
    await dictionaryService.addWordToDictionary(userId, word, translation);
    await ctx.answerCbQuery('Слово добавлено в словарь!');
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  } catch (error) {
    console.error('Error adding word to dictionary:', error);
    await ctx.answerCbQuery('Ошибка при добавлении слова в словарь');
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