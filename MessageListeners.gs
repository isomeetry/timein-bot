function callbackDataListener(data = 'w_10:36', messageId, sender, botChatId) {
  var isCallbackFromWfh = data.includes('w_') || data.includes('o_');
  var knoxId = getKnoxId(botChatId);

  if (isCallbackFromWfh) {
    var TIME_LOG_SHEET = SpreadsheetApp.openById(SSID).getSheetByName(SPREADSHEETS.TIMELOGS);
    var isWfh = data.includes('w_');
    var parsedTimeStr = data.slice((data.indexOf('_') + 1));

    TIME_LOG_SHEET.appendRow([
      botChatId,
      knoxId,
      sender,
      getDate(),
      isWfh ? WORK_ARRANGEMENTS.WFH : WORK_ARRANGEMENTS.ONSITE,
      parsedTimeStr,
    ]);

    deleteMessage(botChatId, messageId);
    sendMessage(botChatId, generateBotMessageToSender(sender, parsedTimeStr, isWfh, true));

    // Change first parameter to GROUP_CHAT_ID when done with testing
    sendMessage(botChatId, generateBotMessageToGroup(knoxId, parsedTimeStr, isWfh, true));
  }

  return;
}

function commandListener(message = '/time_in 8:30am', sender = '', senderId = '', groupChatId, botChatId) {
  var cmdParams = message.split(' ');
  var commandStr = cmdParams[0] || '';
  var arg1 = cmdParams[1] || '';
  var knoxIdFromAdmin = arg1;
  var timeStr = arg1.length > 0 ? getTimeObjFromText(arg1).time24hr : getTime();
  var isTimeIn = true;
  var isWfh = commandStr.includes(COMMANDS.WFH_IN) || commandStr.includes(COMMANDS.WFH_OUT) || 
    commandStr.includes(COMMANDS.SUPER_ADMIN.GET_TOTAL_WFH_ALL);

  var params = {
    botChatId,
    groupChatId,
    isTimeIn,
    isWfh,
    senderId,
    sender,
    timeStr
  };

  Logger.log(commandStr);
  sendMessage(botChatId, commandStr);

  switch(commandStr) {
    case COMMANDS.TIME_IN:
      addTimeIn(params);
      break;
    case COMMANDS.TIME_OUT:
      addTimeOut(params);
      break;
    case COMMANDS.FORMATS:
      showFormats(params);
      break;
    case COMMANDS.HELP:
      showHelp(params);
      break;
    case COMMANDS.ABOUT:
      showAbout(params);
      break;
    case COMMANDS.MY_TIMESHEET:
      getTimeSheet(params);
      break;
    case COMMANDS.SUPER_ADMIN.GET_TIMESHEET:
      getTimeSheet({ ...params, knoxIdFromAdmin });
      break;
    case COMMANDS.SUPER_ADMIN.GET_TOTAL_WFH_ALL:
      case COMMANDS.SUPER_ADMIN.GET_TOTAL_ONSITE_ALL:
      getTotalDaysAll(params);
      break;
    default: 
      break;
  }

  return;
}

function generateBotMessageToGroup(knoxId, timeStr, isWfh, isTimeIn) {
  /**
   * kg.ramos
   * 🏠◂🟢 08:00
   * 
   * kg.ramos
   * 🏢▸🔴 09:00
   */
  var emoji = isWfh ? '🏠' : '🏢';
  var type = isTimeIn ? '◂🟢' : '▸🔴';
  var name = ' <b>' + knoxId + '</b> — ';

  return emoji + type + name + timeStr;
}

function generateBotMessageToSender(name, timeStr, isWfh, isTimeIn) {
  var recordedTimeIn = 'This is recorded';
  var recordedTimeOut = 'Hi ' + name + ', your time out is recorded.';

  var partingTimeIn = 'Good luck at work today! 😊';
  var partingTimeOut = isWfh ? 'Have a great rest of your day! 💆' : 'Take care when going home! 👋';

  return (isTimeIn ? recordedTimeIn + partingTimeIn : recordedTimeOut + partingTimeOut);
}


function legacy_commandListener(chatId, text = '', sender = '', sameChatId) {
  var offsetSheet = SpreadsheetApp.openById(SSID).getSheetByName(SPREADSHEETS.OFFSETS);

  var cmdParam = '';
  var offsetObj = { h: -1, m: -1 };

  if (text.includes(COMMANDS.ADD) || text.includes(COMMANDS.USE)) { // Added /useoffset as well since length is same

    // Remove command string from param string
    cmdParam = text.slice(text.indexOf(' ')).toLowerCase().trim();

    // Case 1: "h:m format"
    var clnParamIndex = cmdParam.indexOf(':');

    // Case 2 "xhxm" format
    var hParamIndex = cmdParam.indexOf('h');
    var mParamIndex = cmdParam.indexOf('m');
    var hasDecimalPoint = cmdParam.indexOf('.') > -1;

    if (clnParamIndex > -1) {
      offsetObj = parseFromDelimiter(cmdParam.replace(/[^\d:]/g, ''), ':');
    } else if (hParamIndex > -1 || mParamIndex > -1) {
      if (hasDecimalPoint) {
        sendMessage(chatId, MESSAGES.INVALID_FORMAT);
        return;
      }
      offsetObj = parseFromDelimiter(cmdParam.replace(/[^\dhm]/g, ''), 'h');
    } else {
      offsetObj = parseFromDecimal(cmdParam.replace(/[^\d.]/g, ''));
    }

    var isNegativeTime = +offsetObj.h < 0 || +offsetObj.m < 0;
    var isZeroTime = +offsetObj.h === 0 && +offsetObj.m === 0;
    var isNaNTime =  isNaN(offsetObj.h) || isNaN(offsetObj.m);

    if (isNegativeTime || isZeroTime || isNaNTime) {
      sendMessage(chatId, MESSAGES.INVALID_FORMAT);
      return;
    } else {
      var currH = offsetSheet.getDataRange().getCell(USERS[sender], OFFSETS_TABLE_COLS.H).getValue();
      var currM = offsetSheet.getDataRange().getCell(USERS[sender], OFFSETS_TABLE_COLS.M).getValue();

      if (text.includes(COMMANDS.ADD)) {
        var overflow = 0;

        if (offsetObj.m + currM >= 60) {
          // use division
          var multiplier = ~~((offsetObj.m + currM) / 60);
          currH += multiplier; // currH += 1;
          overflow = 60 * multiplier; // overflow = 60; 
        }

        offsetSheet.getRange(USERS[sender], OFFSETS_TABLE_COLS.H).setValue(currH + offsetObj.h);
        offsetSheet.getRange(USERS[sender], OFFSETS_TABLE_COLS.M).setValue(currM + offsetObj.m - overflow);
        offsetSheet.appendRow([getDate(), COMMANDS.ADD, sender, text.slice(COMMANDS.ADD.length)]);
        sendMessage(chatId, '✅➕ Offset hours added!');
      }

      if (text.includes(COMMANDS.USE)) {
        var errorStr = MESSAGES.OFFSET_NOT_ENOUGH;
        var useMultiplier = Math.max(~~(offsetObj.m / 60), 1);

        if (currH - offsetObj.h < 0) {
          sendMessage(chatId, errorStr);
          return;
        }

        if (currM - offsetObj.m < 0) {
          currH -= useMultiplier; // 1
          if (currH - offsetObj.h < 0) {
            sendMessage(chatId, errorStr);
            return;
          } else {
            currM += (60 * useMultiplier);

            if (currM - offsetObj.m < 0) {
              sendMessage(chatId, errorStr);
              return;
            }
          }
        }

        // TODO: Extract as function
        offsetSheet.getRange(USERS[sender], OFFSETS_TABLE_COLS.H).setValue(currH - offsetObj.h);
        offsetSheet.getRange(USERS[sender], OFFSETS_TABLE_COLS.M).setValue(currM - offsetObj.m);
        offsetSheet.appendRow([getDate(), COMMANDS.USE, sender, text.slice(COMMANDS.USE.length)]);
        sendMessage(chatId, '✅➖ Offset hours used.');
      }
    }
  }

  if (text.includes(COMMANDS.CHECK)) {
    offsetSheet.appendRow([getDate(), COMMANDS.CHECK, sender]);

    // Check first if sender is valid
    if (USERS.hasOwnProperty(sender)) {
      var totalOffset = offsetSheet.getDataRange().getCell(USERS[sender], OFFSETS_TABLE_COLS.TOTAL).getValue();
      var totalOffsetHours = offsetSheet.getDataRange().getCell(USERS[sender], OFFSETS_TABLE_COLS.H).getValue();
      var totalOffsetMinutes = offsetSheet.getDataRange().getCell(USERS[sender], OFFSETS_TABLE_COLS.M).getValue();

      sendMessage(chatId, '⏳ Total offset time for '+ sender + ': *' + totalOffsetHours + 'h ' + totalOffsetMinutes + 'm*', parse_mode = 'Markdown');
    } else {
      sendMessage(MESSAGES.USER_NOT_FOUND);
    }
  }

  if (text.includes(COMMANDS.HELP)) {
    sendMessage(
      sameChatId,
      MESSAGES.HELP,
    );
  } else if (text.includes(COMMANDS.ABOUT)) {
    sendMessage(
      sameChatId,
      MESSAGES.ABOUT,
    );
  } else if (text.includes(COMMANDS.FORMATS)) {
    sendMessage(
      sameChatId,
      MESSAGES.FORMATS,
    );    
  }

  return;
}

function timeEventListener(chatId, text = '', senderId = '', sender = '') {
  var type = getTypeFromText(text);
  if (type === INVALID_STR || time === -1) {
    return;
  }

  var timeLog = SpreadsheetApp.openById(SSID).getSheetByName(SPREADSHEETS.TIME_LOG);
  var timeSheet = SpreadsheetApp.openById(SSID).getSheetByName(SPREADSHEETS.TIME_SHEET);

  var timeObj = getTimeObjFromText(getTimeFromText(text));
  var time = timeObj.time24hr; //getTimeFromText(text);
  var timeStatus = '';
  var notes = timeObj.extras || '';

  var isNegativeTime = +timeObj.hour < 0 || +timeObj.minute < 0;
  var isZeroTime = +timeObj.hour === 0 && +timeObj.minute === 0;
  var isNaNTime =  isNaN(timeObj.hour) || isNaN(timeObj.minute);
  var isOverAllowedTime = +timeObj.hour > 24 || +timeObj.minute > 59;

  if (isNegativeTime || isZeroTime || isNaNTime || isOverAllowedTime) {
    sendMessage(
      chatId,
      type === TIME_IN ? MESSAGES.TIME_UNRECOGNIZED_IN : MESSAGES.TIME_UNRECOGNIZED_OUT,
    );
    return;
  }

  // late: if AM and time is between 10:30AM - 11AM
  // early in: if AM and time is before 7:30AM
  // night diff: if PM and time is between 10PM - 12AM

  // CHECK if inputs last week were cleared

  var isBlank = timeSheet.getRange('B3:V19').isBlank();
  var rowOffset = 1; // isBlank ? 1 : 21; // check if timing in from same day

  if (USERS.hasOwnProperty(sender)) {
    timeSheet.getRange(USERS[sender] + rowOffset, getColFromDay(type === TIME_IN)).setValue(time);

    if (notes.length > 0) {
      var noteCellValue = timeSheet.getRange(USERS[sender] + rowOffset, getColFromDay(false) + 1).getValue();
      timeSheet.getRange(USERS[sender] + rowOffset, getColFromDay(false) + 1).setValue(noteCellValue + ' ' + notes);
    }
  }
  
  timeLog.appendRow([
    getDate(),
    senderId,
    sender,
    type,
    timeObj.hour,
    timeObj.minute,
    time,
    notes,
    timeStatus,
  ]);
}
