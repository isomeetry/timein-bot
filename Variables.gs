var token = '5059599217:AAHE8i19weLbOo6hodEWpVsMxU0kbhBrSXo';
var telegramAppUrl = 'https://api.telegram.org/bot' + token;
var webAppUrl = 'https://script.google.com/macros/s/AKfycbzfTtFhiOz3Ifp6RowkwgSoShc0VeofAAf411C1NlV35e4K_F--bJh0-in54EfooHkIag/exec';


// Spreadsheet id taken from address bar
var SSID = '14_EApMeyskOmbogKElkAQsuDnBrYxi96ioYuOUlV6fE';

var GROUP_CHAT_ID = -1001420052748; 

var SPREADSHEETS = {
  TIME_LOG: 'TimeSheetLogs',
  TIME_SHEET: 'TimeSheet',
  OFFSETS: 'Offsets',
  USERS: 'USERS',
  ROLES: 'ROLES',
  TIMELOGS: 'TIMELOGS',
};

// Bot commands
var COMMANDS = {
  'ADD': '/addoffset',
  'USE': '/useoffset',
  'CHECK': '/checkoffset',
  'HELP': '/help',
  'ABOUT': '/about',
  'FORMATS': '/formats',
  'WFH_IN': '/wfh_in',
  'WFH_OUT': '/wfh_out',
  'ONSITE_IN': '/onsite_in',
  'ONSITE_OUT': '/onsite_out',
  'TIME_IN': '/time_in',
  'TIME_OUT': '/time_out',
};

// Work arrangements
var WORK_ARRANGEMENTS = {
  'WFH': 'WFH',
  'ONSITE': 'Onsite'
};

// Users table ENUM ID
var USERS = {
  Mito: 2,
  Ana: 3,
  Jom: 4,
  Gyra: 5,
  Patrick: 6,
  Mariben: 7,
  Francis: 8,
  Joanne: 9,
  A: 10,
  'John Ernest': 11,
  Aaron: 12,
  Jay: 13,
  Dar: 14,
  Jhom: 15,
  MJ: 16,
  zvel: 17,
  Reuben: 18,
  RBunag: 19,
  Raiven: 20,
  'Augusto Adamson': 21,
  whaleford: 22,
  'Jeremy Renzo': 23,
  'Louie Dave': 24,
  'Raphael': 25,
  'r.renacia': 26,
  'Dahlie Jean': 27,
  'Carlos': 28,
  'Gladys': 29,
  'Caleb': 30,
};

var TIME_TABLE_DAY_COLS = {
  MON: 2,
  TUE: 5,
  WED: 8,
  THU: 11,
  FRI: 14,
  SAT: 17,
  SUN: 20,
}

var OFFSETS_TABLE_COLS = {
  H: 5,
  M: 6,
  TOTAL: 7,
}

// String Constants
var TIME_IN = 'IN';
var TIME_OUT = 'OUT';
var INVALID_STR = '';

var MESSAGES = {
  INVALID_FORMAT:
    '❌ Time format is invalid. See /formats for sample time formats.',
  TIME_UNRECOGNIZED_IN:
    '⚠️ Unable to register Time In. See /formats for sample time formats.',
  TIME_UNRECOGNIZED_OUT:
    '⚠️ Unable to register Time Out. See /formats for sample time formats.',

  USER_NOT_FOUND:
    '⚠️ User not found in database',
  OFFSET_NOT_ENOUGH:
    '⚠️ You do not have enough offset balance. Run /checkoffset first to see your total offset time.',


  FORMATS:
    '— Timing In / Out — %0A' +
    '12hr format (case/space insensitive): %0A' +
    '✔️ Time in: h:ma (note)%0A' +
    '✔️ Time out: h:ma (note)%0A' +
    '⚠️ If an invalid format is sent, please resend a new message and delete the old one (Editing will not trigger the bot).%0A' +
    '⚠️ Timing out past 12MN will be counted as time out on the next day. Please avoid working past midnight. %0A' +
    '%0A%0A' +
    '— Sample time formats for offsets —%0A' +
    '✔️ 5h30m ~ 2h ~ 30m (xhxxm)%0A' +
    '✔️ 5:30 ~ 0:45 (xx:xx)%0A' +
    '✔️ 3.5 ~ 2 (x.x)(in hours)',


  ABOUT:
    '— About — %0A' +
    '※ This bot registers user daily time in/out. %0A' +
    '※ This bot can also be used to check, add, and use offsets with bot commands. %0A%0A' + 
    'To update or check offsets, send a private message to the bot and input a command. %0A' +
    '%0A※ Please time in/out and update your offsets diligently. %0A%0A' + 
    'The bot%27s time sheet can be viewed here: https://docs.google.com/spreadsheets/d/14_EApMeyskOmbogKElkAQsuDnBrYxi96ioYuOUlV6fE/ %0A%0A',


  HELP:
    '— How to time in/out? — %0A' +
    'Time in/out in the group chat by having the keywords %22Time in:%22 or %22Time out:%22 (case insensitive)' +
    '%0A%0A' +
    '— What are offsets? — %0A' +
    'Offsets are the extra hours you%27ve accumulated when you do unpaid overtime. This is an internal arrangement which acts as a substitute for OT filing during WFH. You may use those extra hours to %22offset%22 work hours on another day.%0A%0A' +
    '— List of commands — %0A' +
    '👀 PM the bot and enter the following:%0A%0A' +
    '/addoffset (time) - Store extra hours rendered for work during the day.%0A' +
    '/useoffset (time) - Redeem and use your extra hours.%0A' +
    '/checkoffset - Check your total offset time balance.%0A' +
    '/formats - Shows valid formats for in/out and offsets.%0A' +
    '/help - Show list of commands.%0A' +
    '/about - Know more about the bot. %0A%0A',
}
