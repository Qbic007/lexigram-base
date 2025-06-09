import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.command('start', (ctx) => ctx.reply('Test bot started'));

console.log('Starting test bot...');
bot.launch()
  .then(() => console.log('Test bot started successfully'))
  .catch((err) => {
    console.error('Test bot failed to start:', err);
    process.exit(1);
  }); 