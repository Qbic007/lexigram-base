import { Telegraf, Markup, Context } from 'telegraf';
import dotenv from 'dotenv';
import path from 'path';
import { TranslationService } from './services/translation.service';
import { DictionaryService } from './services/dictionary.service';

// Загружаем переменные окружения
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Проверяем наличие токена
if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set in .env file');
}

// Создаем экземпляры сервисов
const translationService = TranslationService.getInstance();
const dictionaryService = DictionaryService.getInstance();

// Создаем экземпляр бота
const bot = new Telegraf<Context>(process.env.BOT_TOKEN);

// Обработчик команды /start
bot.start(async (ctx) => {
  await ctx.reply(
    'Привет! Я бот для изучения английского языка. Отправь мне слово, и я переведу его.',
    getMenuKeyboard()
  );
});

// Обработчик текстовых сообщений
bot.on('text', async (ctx) => {
  const word = ctx.message.text;
  try {
    const translation = await translationService.translateWord(word);
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('Добавить в словарь', `add_${word}_${translation}`)
    ]);

    await ctx.reply(
      `Перевод слова "${word}":\n${translation}`,
      keyboard
    );
  } catch (error) {
    console.error('Error translating word:', error);
    await ctx.reply('Произошла ошибка при обработке слова.');
  }
});

// Обработчик нажатия на кнопку добавления в словарь
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

// Обработчик нажатия на кнопку меню
bot.action('menu', async (ctx) => {
  await ctx.editMessageText(
    'Выберите действие:',
    Markup.inlineKeyboard([
      [Markup.button.callback('Посмотреть словарь', 'view_dictionary')],
      [Markup.button.callback('Вернуться', 'back')]
    ])
  );
});

// Обработчик нажатия на кнопку "Посмотреть словарь"
bot.action('view_dictionary', async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) {
    await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
    return;
  }

  try {
    const dictionary = await dictionaryService.getUserDictionary(userId);
    if (dictionary.length === 0) {
      await ctx.editMessageText(
        'Ваш словарь пуст.',
        getMenuKeyboard()
      );
      return;
    }

    const dictionaryText = dictionary
      .map(item => `${item.word} - ${item.translation}`)
      .join('\n');

    await ctx.editMessageText(
      `Ваш словарь:\n\n${dictionaryText}`,
      getMenuKeyboard()
    );
  } catch (error) {
    console.error('Error getting dictionary:', error);
    await ctx.editMessageText(
      'Произошла ошибка при получении словаря.',
      getMenuKeyboard()
    );
  }
});

// Обработчик нажатия на кнопку "Вернуться"
bot.action('back', async (ctx) => {
  await ctx.editMessageText(
    'Отправьте мне слово для перевода.',
    getMenuKeyboard()
  );
});

// Функция для создания клавиатуры с кнопкой меню
function getMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Меню', 'menu')]
  ]);
}

// Запускаем бота
bot.launch()
  .then(() => {
    console.log('Bot started');
  })
  .catch((error) => {
    console.error('Error starting bot:', error);
  });

// Включаем graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 