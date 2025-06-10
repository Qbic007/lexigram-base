import { Telegraf, Markup, Context, NarrowedContext } from 'telegraf';
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

// Создаем постоянную клавиатуру с кнопкой меню
const menuKeyboard = Markup.keyboard([
  ['📚 Меню']
]).resize();

// Простая in-memory Map для хранения состояния редактирования
const editState = new Map<number, string>(); // userId -> wordId

// Обработчик команды /start
bot.start(async (ctx: Context) => {
  await ctx.reply(
    'Привет! Я бот для изучения английского языка. Отправь мне слово, и я переведу его.',
    menuKeyboard
  );
});

// Обработчик нажатия на кнопку меню
bot.hears('📚 Меню', async (ctx: Context) => {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Посмотреть словарь', 'view_dictionary')],
    [Markup.button.callback('Вернуться', 'back')]
  ]);
  await ctx.reply('Выберите действие:', keyboard);
});

// Обработчик текстовых сообщений с учётом состояния редактирования
bot.on('text', async (ctx: any) => {
  if (!ctx.message || typeof ctx.message !== 'object' || !('text' in ctx.message)) {
    return;
  }
  const text = ctx.message.text;
  
  // Если пользователь в режиме редактирования
  const wordId = editState.get(ctx.from?.id);
  if (wordId) {
    // Ожидаем формат "слово - перевод"
    const parts = text.split('-').map((s: string) => s.trim());
    if (parts.length !== 2) {
      await ctx.reply('Пожалуйста, введите в формате: слово - перевод');
      return;
    }
    const [word, translation] = parts;
    try {
      await dictionaryService.updateWord(ctx.from.id, wordId, word, translation);
      await ctx.reply('Слово успешно обновлено!');
      editState.delete(ctx.from.id);
    } catch (error) {
      console.error('Error updating word:', error);
      await ctx.reply('Ошибка при обновлении слова');
    }
    return;
  }

  if (text === '📚 Меню') {
    return; // Этот случай обрабатывается отдельным обработчиком
  }

  try {
    const translation = await translationService.translateWord(text);
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('Добавить в словарь', `add_${text}`)]
    ]);
    await ctx.reply(`Перевод: ${translation}`, keyboard);
  } catch (error) {
    console.error('Translation error:', error);
    await ctx.reply('Извините, произошла ошибка при переводе.');
  }
});

// Обработчик добавления слова в словарь
bot.action(/^add_(.+)$/, async (ctx: any) => { // ctx.match: [string, string]
  if (!ctx.from) {
    await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
    return;
  }
  const word = ctx.match[1];
  try {
    const translation = await translationService.translateWord(word);
    await dictionaryService.addWordToDictionary(ctx.from.id, word, translation);
    await ctx.answerCbQuery('Слово добавлено в словарь!');
  } catch (error) {
    console.error('Error adding word to dictionary:', error);
    await ctx.answerCbQuery('Ошибка при добавлении слова в словарь');
  }
});

// Обработчик просмотра словаря
bot.action('view_dictionary', async (ctx: Context) => {
  if (!ctx.from) {
    await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
    return;
  }
  try {
    const dictionary = await dictionaryService.getUserDictionary(ctx.from.id);
    if (dictionary.length === 0) {
      await ctx.editMessageText('Ваш словарь пуст');
      return;
    }
    await ctx.editMessageText('Ваш словарь:');
    for (const item of dictionary) {
      const message = `${item.word} - ${item.translation}`;
      await ctx.reply(message, Markup.inlineKeyboard([
        [Markup.button.callback('✏️', `edit_${item._id}`), Markup.button.callback('🗑️', `delete_${item._id}`)]
      ]));
    }
  } catch (error) {
    console.error('Error getting dictionary:', error);
    await ctx.editMessageText('Ошибка при получении словаря');
  }
});

// Обработчик редактирования слова
bot.action(/^edit_(.+)$/, async (ctx: any) => {
  if (!ctx.from) {
    await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
    return;
  }
  const wordId = ctx.match[1];
  
  try {
    // Получаем текущее слово из словаря
    const dictionary = await dictionaryService.getUserDictionary(ctx.from.id);
    const wordToEdit = dictionary.find(item => item._id === wordId);
    
    if (!wordToEdit) {
      await ctx.answerCbQuery('Слово не найдено');
      return;
    }

    editState.set(ctx.from.id, wordId);
    await ctx.answerCbQuery();
    
    // Отправляем сообщение без плейсхолдера
    await ctx.reply(
      'Введите новое слово и перевод через дефис:',
      Markup.forceReply()
    );
  } catch (error) {
    console.error('Error getting word:', error);
    await ctx.answerCbQuery('Ошибка при получении слова');
  }
});

// Обработчик удаления слова
bot.action(/^delete_(.+)$/, async (ctx) => {
  if (!ctx.from) {
    await ctx.answerCbQuery('Ошибка: не удалось определить пользователя');
    return;
  }
  const wordId = ctx.match[1];
  const userId = ctx.from.id;
  
  try {
    await dictionaryService.deleteWord(userId, wordId);
    await ctx.answerCbQuery('Слово удалено');
    // Удаляем сообщение с удаленным словом
    await ctx.deleteMessage();
  } catch (error) {
    console.error('Error deleting word:', error);
    await ctx.answerCbQuery('Ошибка при удалении слова');
  }
});

// Обработчик кнопки "Вернуться"
bot.action('back', async (ctx: Context) => {
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Посмотреть словарь', 'view_dictionary')],
    [Markup.button.callback('Вернуться', 'back')]
  ]);
  await ctx.editMessageText('Выберите действие:', keyboard);
});

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