const { Telegraf } = require('telegraf');
const path = require('path');
const dotenv = require('dotenv');

console.log('Current directory:', __dirname);
console.log('Env file path:', path.resolve(__dirname, '../.env'));

const result = dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('Dotenv config result:', result);

console.log('BOT_TOKEN:', process.env.BOT_TOKEN);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', (ctx) => ctx.reply('Test bot started'));

console.log('Starting test bot...');
bot.launch()
  .then(() => console.log('Test bot started successfully'))
  .catch((err) => {
    console.error('Test bot failed to start:', err);
    process.exit(1);
  }); 