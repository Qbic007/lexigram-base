import { Telegraf, session, Context } from 'telegraf';
import path from 'path';
import { UserService } from './services/user.service';
import { DictionaryService } from './services/dictionary.service';

// Загружаем .env через require
require('dotenv').config();

// Отладочный вывод
console.log('Environment variables:');
console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? 'exists' : 'missing');
console.log('USER_SERVICE_URL:', process.env.USER_SERVICE_URL);
console.log('DICTIONARY_SERVICE_URL:', process.env.DICTIONARY_SERVICE_URL);

if (!process.env.BOT_TOKEN) {
  console.error('Error: BOT_TOKEN is not set in .env file');
  process.exit(1);
}

// Определяем типы состояний
interface SessionData {
  state: 'idle' | 'waiting_for_language' | 'waiting_for_word';
}

interface BotContext extends Context {
  session: SessionData;
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN);
const userService = new UserService();
const dictionaryService = new DictionaryService();

// Инициализация сессии
bot.use(session());

// Добавляем обработчики для отладки
bot.telegram.getMe().then((botInfo) => {
  console.log('Bot connected successfully!');
  console.log('Bot username:', botInfo.username);
});

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// Middleware для проверки регистрации пользователя
bot.use(async (ctx, next) => {
  if (ctx.from) {
    try {
      await userService.getUser(ctx.from.id.toString());
    } catch (error) {
      if (ctx.from.username) {
        await userService.createUser(ctx.from.id.toString(), ctx.from.username);
      } else {
        await ctx.reply('Пожалуйста, установите username в настройках Telegram для использования бота.');
        return;
      }
    }
  }
  return next();
});

// Команды
bot.start(async (ctx) => {
  if (!ctx.session) {
    ctx.session = { state: 'idle' };
  } else {
    ctx.session.state = 'idle';
  }
  const user = await userService.getUser(ctx.from!.id.toString());
  await ctx.reply(
    `Добро пожаловать в Lexigram, ${user.username}!\n` +
    'Я помогу вам учить слова.\n\n' +
    'Доступные команды:\n' +
    '/add - добавить новое слово\n' +
    '/words - просмотр слов\n' +
    '/settings - настройки\n' +
    '/language - выбор языка'
  );
});

bot.help((ctx) => ctx.reply(
  'Доступные команды:\n' +
  '/start - начать\n' +
  '/help - справка\n' +
  '/add - добавить новое слово\n' +
  '/words - просмотр слов\n' +
  '/settings - настройки\n' +
  '/language - выбор языка'
));

// Добавление слова
bot.command('add', async (ctx) => {
  const user = await userService.getUser(ctx.from!.id.toString());
  if (user.languages.length === 0) {
    await ctx.reply('Сначала выберите язык для изучения: /language');
    return;
  }
  ctx.session.state = 'waiting_for_word';
  await ctx.reply('Введите слово и его перевод в формате:\nслово - перевод');
});

// Просмотр слов
bot.command('words', async (ctx) => {
  const user = await userService.getUser(ctx.from!.id.toString());
  if (user.languages.length === 0) {
    await ctx.reply('Сначала выберите язык для изучения: /language');
    return;
  }
  
  try {
    const words = await dictionaryService.getWordsByUser(user.telegramId, user.languages[0]);
    if (words.length === 0) {
      await ctx.reply('У вас пока нет добавленных слов.');
      return;
    }
    
    const wordsList = words.map(word => 
      `${word.original} - ${word.translation} (${word.status})`
    ).join('\n');
    
    await ctx.reply(`Ваши слова:\n\n${wordsList}`);
  } catch (error) {
    await ctx.reply('Произошла ошибка при получении списка слов.');
  }
});

// Настройки
bot.command('settings', async (ctx) => {
  const user = await userService.getUser(ctx.from!.id.toString());
  await ctx.reply(
    'Ваши настройки:\n\n' +
    `Изучаемые языки: ${user.languages.join(', ') || 'не выбраны'}\n` +
    `Частота повторений: ${user.schedule.frequency}\n` +
    `Время уведомлений: ${user.schedule.times.join(', ') || 'не установлено'}\n\n` +
    'Используйте /language для изменения языков'
  );
});

// Выбор языка
bot.command('language', async (ctx) => {
  if (!ctx.session) {
    ctx.session = { state: 'waiting_for_language' };
  } else {
    ctx.session.state = 'waiting_for_language';
  }
  await ctx.reply(
    'Выберите язык для изучения:\n\n' +
    'en - Английский\n\n' +
    'Отправьте код языка (например, "en")'
  );
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  const text = ctx.message.text.toLowerCase();
  
  // Обработка выбора языка
  if (ctx.session.state === 'waiting_for_language') {
    const validLanguages = ['en', 'es', 'fr', 'de'];
    if (validLanguages.includes(text)) {
      const user = await userService.getUser(ctx.from!.id.toString());
      const languages = [...new Set([...user.languages, text])];
      
      try {
        await userService.updateUserLanguages(user.telegramId, languages);
        ctx.session.state = 'idle';
        await ctx.reply(`Язык ${text} успешно добавлен в ваш список!`);
      } catch (error) {
        console.error('Ошибка при обновлении списка языков:', error);
        await ctx.reply('Произошла ошибка при обновлении списка языков.');
      }
    } else {
      await ctx.reply('Пожалуйста, выберите язык из списка (en, es, fr, de)');
    }
    return;
  }
  
  // Обработка добавления слова
  if (ctx.session.state === 'waiting_for_word' && text.includes(' - ')) {
    const [original, translation] = text.split(' - ').map(s => s.trim());
    const user = await userService.getUser(ctx.from!.id.toString());
    
    try {
      await dictionaryService.addWord({
        userId: user.telegramId,
        languageId: user.languages[0],
        original,
        translation,
        status: 'new',
        addedAt: new Date()
      });
      ctx.session.state = 'idle';
      await ctx.reply('Слово успешно добавлено!');
    } catch (error) {
      console.error('Ошибка при добавлении слова:', error);
      await ctx.reply('Произошла ошибка при добавлении слова. Попробуйте еще раз.');
    }
    return;
  }
  
  // Если не в ожидании ввода, игнорируем сообщение
  if (ctx.session.state === 'idle') {
    await ctx.reply('Используйте команды для взаимодействия с ботом. /help - для списка команд.');
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 