import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';
import { Markup } from 'telegraf';
import { UserService } from './services/user.service';
import { TranslationService } from './services/translation.service';
import { DictionaryService } from './services/dictionary.service';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие токена
if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set in .env file');
}

const bot = new Telegraf<Context>(process.env.BOT_TOKEN);
const userService = new UserService();
const translationService = new TranslationService();
const dictionaryService = new DictionaryService();

// Простая Map для хранения состояния пользователей
const userStates = new Map<number, any>();

// Команды
bot.command('start', async (ctx: Context) => {
  try {
    if (!ctx.from) return;
    await userService.createUser(ctx.from.id);
    await ctx.reply(
      'Привет! Я бот для изучения английского языка. Я помогу тебе создать свой словарь и учить новые слова.\n\n' +
      'Доступные команды:\n' +
      '/add - Добавить новое слово\n' +
      '/dictionary - Посмотреть свой словарь\n' +
      '/translate - Перевести слово'
    );
    userStates.set(ctx.from.id, {});
  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Произошла ошибка при запуске бота. Пожалуйста, попробуйте позже.');
  }
});

// Добавление слова
bot.command('add', async (ctx: Context) => {
  try {
    if (!ctx.from) return;
    await ctx.reply('Введите слово и его перевод в формате "слово - перевод"');
    userStates.set(ctx.from.id, { state: 'adding_word' });
  } catch (error) {
    console.error('Error in add command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

// Просмотр словаря
bot.command('dictionary', async (ctx: Context) => {
  try {
    if (!ctx.from) return;
    const words = await dictionaryService.getUserDictionary(ctx.from.id);
    if (!words || words.length === 0) {
      await ctx.reply('Ваш словарь пуст. Используйте команду /add чтобы добавить слова.');
      return;
    }
    await ctx.reply('Ваш словарь:');
    for (const item of words) {
      const message = `${item.word} - ${item.translation}`;
      await ctx.reply(message, Markup.inlineKeyboard([
        [Markup.button.callback('✏️', `edit_${item._id}`), Markup.button.callback('🗑️', `delete_${item._id}`)]
      ]));
    }
  } catch (error) {
    console.error('Error in dictionary command:', error);
    await ctx.reply('Произошла ошибка при получении словаря. Пожалуйста, попробуйте позже.');
  }
});

// Перевод слова
bot.command('translate', async (ctx: Context) => {
  try {
    if (!ctx.from) return;
    await ctx.reply('Введите слово для перевода');
    userStates.set(ctx.from.id, { state: 'translating' });
  } catch (error) {
    console.error('Error in translate command:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

// Обработка текстовых сообщений
bot.on(message('text'), async (ctx: Context) => {
  try {
    if (!ctx.from) return;
    if (!ctx.message) {
      await ctx.reply('Пожалуйста, отправьте текстовое сообщение.');
      return;
    }
    const text = (ctx.message as any).text;
    if (typeof text !== 'string') {
      await ctx.reply('Пожалуйста, отправьте текстовое сообщение.');
      return;
    }
    const stateObj = userStates.get(ctx.from.id) || {};
    if (!stateObj.state) {
      // Проверяем, не является ли сообщение командой меню
      if (text.startsWith('/') || text === '📚 Меню') {
        await ctx.reply(
          'Доступные команды:\n' +
          '/add - Добавить новое слово\n' +
          '/dictionary - Посмотреть свой словарь\n' +
          '/translate - Перевести слово\n\n' +
          'Или просто отправьте слово, и я его переведу!'
        );
        return;
      }
      // Если нет состояния — считаем, что это запрос на перевод
      const translation = await translationService.translate(text);
      await ctx.reply(
        `Перевод: ${translation}`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback('✅ Добавить', `confirm_${text}_${translation}`),
            Markup.button.callback('❌ Отмена', 'cancel_translation')
          ]
        ])
      );
      userStates.set(ctx.from.id, {});
      return;
    }
    switch (stateObj.state) {
      case 'adding_word': {
        const [word, translation] = text.split(' - ').map((s: string) => s.trim());
        if (!word || !translation) {
          // Если пользователь ввел только слово, пробуем перевести его
          if (word) {
            try {
              const translatedWord = await translationService.translate(word);
              userStates.set(ctx.from.id, { state: 'confirming_translation', word, translation: translatedWord });
              await ctx.reply(
                `Предлагаемый перевод: ${translatedWord}`,
                Markup.inlineKeyboard([
                  [
                    Markup.button.callback('✅ Добавить', `confirm_${word}_${translatedWord}`),
                    Markup.button.callback('❌ Отмена', 'cancel_translation')
                  ]
                ])
              );
              return;
            } catch (error) {
              console.error('Error translating word:', error);
              await ctx.reply('Пожалуйста, используйте формат "слово - перевод"');
              return;
            }
          }
          await ctx.reply('Пожалуйста, используйте формат "слово - перевод"');
          return;
        }
        await dictionaryService.addWord(ctx.from.id, word, translation);
        await ctx.reply('Слово добавлено в словарь!');
        userStates.set(ctx.from.id, {});
        break;
      }
      case 'translating': {
        const translation = await translationService.translate(text);
        await ctx.reply(`Перевод: ${translation}`);
        userStates.set(ctx.from.id, {});
        break;
      }
      case 'editing_word': {
        const [newWord, newTranslation] = text.split(' - ').map((s: string) => s.trim());
        if (!newWord || !newTranslation) {
          await ctx.reply('Пожалуйста, используйте формат "слово - перевод"');
          return;
        }
        await dictionaryService.updateWord(ctx.from.id, stateObj.wordId, newWord, newTranslation);
        await ctx.reply('Слово обновлено!');
        userStates.set(ctx.from.id, {});
        break;
      }
    }
  } catch (error) {
    console.error('Error processing message:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
});

// Обработка callback-запросов
// TODO: заменить any на корректный тип из telegraf, если потребуется
bot.action(/^edit_(.+)$/, async (ctx: any) => {
  try {
    if (!ctx.from) return;
    const wordId = ctx.match[1];
    const dictionary = await dictionaryService.getUserDictionary(ctx.from.id);
    const wordToEdit = dictionary.find((item: any) => item._id === wordId);
    if (!wordToEdit) {
      await ctx.answerCbQuery('Слово не найдено');
      return;
    }
    userStates.set(ctx.from.id, { state: 'editing_word', wordId });
    await ctx.reply(`Редактирование слова "${wordToEdit.word} - ${wordToEdit.translation}"\nВведите новое слово и перевод в формате "слово - перевод"`);
    await ctx.answerCbQuery();
  } catch (error) {
    console.error('Error in edit action:', error);
    await ctx.answerCbQuery('Произошла ошибка');
  }
});

bot.action(/^delete_(.+)$/, async (ctx: any) => {
  try {
    if (!ctx.from) return;
    const wordId = ctx.match[1];
    await dictionaryService.deleteWord(ctx.from.id, wordId);
    await ctx.answerCbQuery('Слово удалено');
    await ctx.deleteMessage();
  } catch (error) {
    console.error('Error in delete action:', error);
    await ctx.answerCbQuery('Произошла ошибка');
  }
});

// Добавляем обработчики для кнопок
bot.action(/^confirm_(.+)_(.+)$/, async (ctx: any) => {
  try {
    if (!ctx.from) return;
    const word = ctx.match[1];
    const translation = ctx.match[2];
    await dictionaryService.addWord(ctx.from.id, word, translation);
    await ctx.editMessageText(`Слово "${word} - ${translation}" добавлено в словарь!`);
    userStates.set(ctx.from.id, {});
  } catch (error) {
    console.error('Error confirming translation:', error);
    await ctx.answerCbQuery('Произошла ошибка при добавлении слова');
  }
});

bot.action('cancel_translation', async (ctx: any) => {
  try {
    if (!ctx.from) return;
    await ctx.editMessageText('Добавление слова отменено. Используйте команду /add для добавления нового слова.');
    userStates.set(ctx.from.id, {});
  } catch (error) {
    console.error('Error canceling translation:', error);
    await ctx.answerCbQuery('Произошла ошибка');
  }
});

// Запуск бота
bot.launch().then(() => {
  console.log('Bot started');
}).catch((error) => {
  console.error('Error starting bot:', error);
});

// Обработка завершения работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 