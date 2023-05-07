var token = '';
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
  'HELP': '/help',
  'ABOUT': '/about',
  'FORMATS': '/formats',
  'TIME_IN': '/time_in',
  'TIME_OUT': '/time_out',
  'MY_TIMESHEET': '/my_timesheet', // consolidated WFH & onsite. default: last 4 weeks
  ADMIN: {
    'ADD_MEMBER': '/add_member',
    'REMOVE_MEMBER': '/remove_member',
  },
  SUPER_ADMIN: {
    'ADD_ADMIN': '/add_admin',
    'REMOVE_ADMIN': '/remove_admin',
    'ADD_SUPER_ADMIN': '/add_super_admin',
    'REMOVE_SUPER_ADMIN': '/remove_super_admin',
    'GET_TIMESHEET': '/get_timesheet', // consolidated WFH & onsite
    'GET_TOTAL_WFH_ALL': '/get_total_wfh_all', // will only return # of days
    'GET_TOTAL_ONSITE_ALL': '/get_total_onsite_all', // will only return # of days
  }
};

// Work arrangements
var WORK_ARRANGEMENTS = {
  'WFH': 'WFH',
  'ONSITE': 'Onsite'
};

// Roles
var ROLES = {
  'MEMBER': 0,
  'ADMIN': 1,
  'SUPER_ADMIN': 2
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
};

var DAY_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed',
                    'Thu', 'Fri', 'Sat'];

var OFFSETS_TABLE_COLS = {
  H: 5,
  M: 6,
  TOTAL: 7,
};

var FOUR_WEEKS_AGO = 16;

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


  FORMATS:
    '⌚ Timing In / Out %0A' +
    '12hr format (case/space insensitive): %0A' +
    '✔️ /time_in %0A' +
    '✔️ /time_in 7:30am %0A' +
    '✔️ /my_wfh_days %0A' +
    // '✔️ /my_timesheet 03/12/2023 04/08/2023 %0A' +
    // '✔️ /my_timesheet %0A' +
    '⚠️ If an invalid format is sent, please resend a new message and delete the old one (Editing will not trigger the bot).%0A' +
    '%0A%0A',


  ABOUT:
    'ℹ️ About %0A' +
    '※ This bot registers user\'s daily time in/out. %0A' +
    '— Send <code>/time_in</code> or <code>/time_out</code> to ClockMon. %0A%0A' +
    '※ Please time in/out diligently. %0A%0A' + 
    'The bot%27s time sheet can be viewed here: https://docs.google.com/spreadsheets/d/14_EApMeyskOmbogKElkAQsuDnBrYxi96ioYuOUlV6fE/ %0A%0A' +
    '※ Questions? Send a message to Mito or Gyra.',


  HELP:
    '🧑‍💻 List of commands %0A' +
    'PM the bot and enter the following:%0A%0A' +
    '<code>/time_in</code> (optional: <code>time</code>) — Record your time in.%0A' +
    '<code>/time_out</code> (optional: <code>time</code>) — Record your time out.%0A' +
    // '<code>/my_timesheet</code> (optional: <code>start_date end_date</code>) — Check your time sheet in the last 4 weeks.%0A' +
    '/formats - Shows valid formats for in/out and offsets.%0A' +
    '/help - Show list of commands.%0A' +
    '/about - Know more about the bot. %0A%0A',
};
