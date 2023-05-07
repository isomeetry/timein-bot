// Run this every time a deployment is made
function setWebhook() {
  var url = telegramAppUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function deleteWebhook() {
  var url = telegramAppUrl + "/deleteWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function sendMessage(id, text, options = null) {
  var url = telegramAppUrl + '/sendMessage';
  var defaultParams = {
    chat_id: id,
    text: decodeURIComponent(text),
    parse_mode: 'HTML',
  };

  if (options) {
    Object.assign(defaultParams, options);
  }

  var urlParams = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(defaultParams),
  }

  return UrlFetchApp.fetch(url, urlParams);
}

function deleteMessage(chatId, messageId) {
  var url = telegramAppUrl + '/deleteMessage?chat_id=' + chatId + '&message_id=' + messageId;
  return UrlFetchApp.fetch(url);
}

function doPost(e) {
  var contents = JSON.parse(e.postData.contents);

  if (contents.message) {
    var chatIdWithBot = contents.message.from.id; // send to chat with bot
    var chatId = contents.message.chat.id; // send from same chat
    var sender = contents.message.from.first_name || null;
    var senderId = contents.message.from.id;
    var text = contents.message.text;
    var msg = contents.message;

    if (msg.hasOwnProperty('entities') && msg.entities[0].type == 'bot_command') {
      commandListener(text, sender, senderId, chatId, chatIdWithBot);
      legacy_commandListener(chatIdWithBot, text, sender, chatId);
    } else {
      timeEventListener(chatId, text, senderId, sender);
    }
  } else if (contents.callback_query) {
    var callbackQuery = contents.callback_query;
    var sender = callbackQuery.from.first_name || null;
    var senderId = callbackQuery.from.id;
    var messageId = callbackQuery.message.message_id;

    callbackDataListener(callbackQuery.data, messageId, sender, senderId);
  }
}
