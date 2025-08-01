const { readFileSync,  writeFileSync } = require("fs");
const path = require('path');
//Пакет для .evn
// require('dotenv').config(); //использую переменные Vercel
//Библеотека для Телеграм-бота
const { Telegraf, Markup } = require('telegraf');
const { message } = require('telegraf/filters')

//Импортируем класс
const GameCities = require('./GameCities');

const BOT_TOKEN = process.env.BOT_TOKEN;
const SECRET_PATH = process.env.SECRET_PATH;
const VERCEL_URL = process.env.VERCEL_URL; // Автоматически устанавливается Vercel

const bot = new Telegraf(BOT_TOKEN);
const gameUsers = new Map();

let stringHi = "Привет! Давай сыграем в 'Города России'.\n" +
            "Цель: Назвать как можно больше городов России по цепочке,\n" +
            "чтобы каждый новый город начинался на последнюю букву предыдущего.\n" +
            "Если город заканчивается на Ь, Ы, Й, Ъ, Ё - берем предпоследнюю букву.\n" +
            "Нельзя повторять уже использованные названия городов.\n" +
            "Выиграет тот, кто дольше продержится.\n" +
            "Сделай свой первый ход!\n\n"+
            "Список команды можно посмотреть, если ввести:\n"+
            "\"/commands\"\n";

let stringCommands = "\"/start\" : Запуск бота или запуск новой игры\n" +
            "\"/help\" : Попросить подсказку. У тебя есть 3 подсказки\n" +
            "\"/commands\" : Список команд\n" +
            "\"/stop\" : Закончить игру\n";

let finishText = "Спасибо, за игру. Было очень здорово играть с тобой! До встречи!\n" +
            "Если захочешь сыграть снова, то введи \"/start\"";

// Чтение файла с абсолютным путем
const dataCitiesPath = path.join(__dirname, 'dataCities.txt');
let dataCities;
try {
  dataCities = readFileSync(dataCitiesPath, 'utf-8').trim().split('\n');//убираем лишние пробелы и строки делаем массив 
} catch (e) {
  console.error('Ошибка чтения файла:', e);
  process.exit(1); // Остановка при ошибке
}


const gameKeyboard = Markup.keyboard([
    ['🎮 Начать игру', '💡 Подсказка'],
    ['📋 Команды', '🚪 Закончить игру']
]).resize().oneTime(false);

bot.start((ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, stringHi, {
    reply_markup: gameKeyboard.reply_markup
  });
  if (gameUsers.has(ctx.chat.id)) {
    gameUsers.get(ctx.chat.id).gameInit();
  } else {
    gameUsers.set(ctx.chat.id, new GameCities(dataCities));
    gameUsers.get(ctx.chat.id).gameInit();  
  }
});

bot.hears('🎮 Начать игру', (ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, stringHi, {
    reply_markup: gameKeyboard.reply_markup
  });
  if (gameUsers.has(ctx.chat.id)) {
    gameUsers.get(ctx.chat.id).gameInit();
  } else {
    gameUsers.set(ctx.chat.id, new GameCities(dataCities));
    gameUsers.get(ctx.chat.id).gameInit();
  }
});

bot.command('stop', (ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, finishText, {
    reply_markup: { remove_keyboard: true }  // Эквивалент Markup.removeKeyboard()
  });
  if (gameUsers.has(ctx.chat.id)) {
    gameUsers.get(ctx.chat.id).gameStop();
  } else {
    gameUsers.set(ctx.chat.id, new GameCities(dataCities));
    gameUsers.get(ctx.chat.id).gameStop();
  }
});

bot.hears('🚪 Закончить игру', (ctx) => {
  ctx.telegram.sendMessage(ctx.chat.id, finishText, {
    reply_markup: { remove_keyboard: true }  // Эквивалент Markup.removeKeyboard()
  });
  if (gameUsers.has(ctx.chat.id)) {
    gameUsers.get(ctx.chat.id).gameStop();
  } else {
    gameUsers.set(ctx.chat.id, new GameCities(dataCities));
    gameUsers.get(ctx.chat.id).gameStop();
  }
});


bot.command('commands', (ctx) => {
  ctx.reply(stringCommands);
});

bot.hears('📋 Команды', (ctx) => {
  ctx.reply(stringCommands);
});

try {
  bot.command('help', async (ctx) => {
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    let response;

    if (gameUsers.has(ctx.chat.id)) {
      response = gameUsers.get(ctx.chat.id).gameHints();
    } else {
      gameUsers.set(ctx.chat.id, new GameCities(dataCities));
      response = gameUsers.get(ctx.chat.id).gameHints();
    }

    if (typeof response === 'string') {
      await ctx.telegram.sendMessage(ctx.chat.id, response);
    } else {
      console.log('Упс, это не строка');
    }
  });
} catch (e) {
  console.log(`Возникла ошибка: ${e}`);
}

try {
  bot.command('help', async (ctx) => {
    await ctx.telegram.sendChatAction(ctx.chat.id, 'typing');
    let response;

    if (gameUsers.has(ctx.chat.id)) {
      response = gameUsers.get(ctx.chat.id).gameHints();
    } else {
      gameUsers.set(ctx.chat.id, new GameCities(dataCities));
      response = gameUsers.get(ctx.chat.id).gameHints();
    }

    if (typeof response === 'string') {
      await ctx.telegram.sendMessage(ctx.chat.id, response);
    } else {
      console.log('Упс, это не строка');
    }
  });
} catch (e) {
  console.log(`Возникла ошибка: ${e}`);
}

try {
  bot.on(message('text'), async (ctx) => {
    const messageText = ctx.message.text;
    const chatId = ctx.message.chat.id;

    console.log("gameUsers " + gameUsers.size);

    await ctx.telegram.sendChatAction(chatId, 'typing');  // Явно указываем chatId

    let response;

    if (typeof messageText === 'string' && messageText) {
      console.log(messageText)
      if (gameUsers.has(ctx.chat.id)) {
        response = gameUsers.get(ctx.chat.id).gameLogic(messageText);
      } else {
        gameUsers.set(ctx.chat.id, new GameCities(dataCities));
        response = gameUsers.get(ctx.chat.id).gameLogic(messageText);
      }
      if (typeof response === 'string') {
        await ctx.telegram.sendMessage(chatId, response);  // Отправка через telegram.sendMessage
      } else {
        console.log('Упс, это не строка');  // Обработка не строкового ответа
      }
    }
  });
} catch (e) {
  console.log(`Возникла ошибка: ${e}`);
}

// Улучшенный middleware для проверки секретного токена
bot.use((ctx, next) => {
    const secretToken = ctx.update?.webhookData?.secret_token || ctx.state.secretPathComponent;
    if (secretToken === SECRET_PATH) {
        return next();
    }
    console.log('Неавторизованный запрос: неверный секретный токен');
    if (ctx.res) {
        return ctx.res.status(401).send('Unauthorized');
    }
    return ctx.telegram.deleteWebhook();
});

// Автоматическая установка webhook при запуске на Vercel
if (VERCEL_URL) {
    const webhookUrl = `https://${VERCEL_URL}/api/bot`;
    bot.telegram.setWebhook(webhookUrl, {
        secret_token: SECRET_PATH,
        drop_pending_updates: true
    }).then(() => {
        console.log(`Webhook установлен на ${webhookUrl}`);
    }).catch(err => {
        console.error('Ошибка при установке webhook:', err);
    });
}

// Serverless-обработчик для Vercel
//webhook-обработчик
module.exports = async (req, res) => {
    try {
        console.log(`Получен запрос: ${req.method} ${req.url}`);
        
        if (req.method === 'POST') {
            // Логирование входящего update (для отладки)
            console.log('Тело запроса:', JSON.stringify(req.body, null, 2));
            
            await bot.handleUpdate(req.body, res);
        } else {
            // Для GET-запросов (проверка работоспособности)
            res.status(200).json({ 
                status: 'OK',
                message: 'Telegram bot is running',
            });
        }
    } catch (err) {
        console.error('Ошибка обработки запроса:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
