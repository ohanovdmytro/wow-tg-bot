const TelegramBot = require("node-telegram-bot-api");
const request = require("request");
require("dotenv").config();

const token = process.env.TG_BOT_TOKEN;
const opt = { polling: true };

const bot = new TelegramBot(token, opt);

bot.on("polling_error", (err) => {
  console.log(err);
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Hi! Type "/city your-city" to get the weather!');
});

bot.on("callback_query", function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  let text;

  if (action === "1") {
    text = "You hit button 1";
  }

  bot.editMessageText(text, opts);
});

bot.onText(/\/city (.+)/, (msg, match) => {
  let city = match[1];
  let chatId = msg.chat.id;
  let query =
    "http://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=6f2800a2d49bb769b75d2c680231acf6";

  request(query, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      bot
        .sendMessage(chatId, "_Looking for details of_ " + city + "...", {
          parse_mode: "Markdown",
        })

        .then(msg);
      {
        res = JSON.parse(body);

        let temp = Math.round(parseInt(res.main.temp_min) - 273.15, 2);

        let pressure = Math.round(parseInt(res.main.pressure) - 1013.15);

        let rise = new Date(parseInt(res.sys.sunrise) * 1000);

        let set = new Date(parseInt(res.sys.sunset) * 1000);

        bot.sendMessage(
          chatId,
          "------ " +
            res.name +
            " ------\nTemperature: " +
            String(temp) +
            "°C\nHumidity: " +
            res.main.humidity +
            " %\nWeather: " +
            res.weather[0].description +
            "\nPressure: " +
            String(pressure) +
            " atm\nSunrise: " +
            rise.toLocaleTimeString() +
            " \nSunset: " +
            set.toLocaleTimeString() +
            "\nCountry: " +
            res.sys.country
        );
      }
    }
  });
});

bot.on("polling_error", console.log);
