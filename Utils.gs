// SHEET FUNCTIONS
function readDataFromRange(spreadsheet = SPREADSHEETS.USERS, rangeA = 'A1', rangeB = 'C20') {
  var rangeStr = spreadsheet + "!" + rangeA + ":" + rangeB;
  var data = SpreadsheetApp.getActive().getRange(rangeStr).getValues();

  return data;
}


// UTIL FUNCTIONS
function getTime() {
  var dateStr = new Date().toLocaleTimeString('en-US', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  return dateStr;
}

function getDate() {
  var dateNow = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Singapore',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return dateNow;
}

function getWeekNumber() {
  var date = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Singapore',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  Logger.log(date);
}

function getColFromDay(isTimeIn = true) {
  var dayStr = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Singapore',
    weekday: 'short',
  }).toUpperCase();

  var colOffset = isTimeIn ? 0 : 1;

  Logger.log(TIME_TABLE_DAY_COLS[dayStr] + colOffset);
  return TIME_TABLE_DAY_COLS[dayStr] + colOffset;
}

// Input cases

function parseFromDelimiter(timeStr = '30m', delimiter = 'h') {
  var arr = [];
  var time = { h: 0, m: 0 };
  
  // Get hour value
  if (delimiter === 'h') {
    Logger.log(timeStr.replace(/[^\dhm]/g, ''));
    arr = timeStr.split('h');

    if (arr.length >= 1 && timeStr.indexOf('h') > -1) {
      time.h = +arr[0];

      if (arr.length > 1) {
        time.m = +arr[1].split('m')[0] || 0;
      }
    } else {
      // Get min value
      time.m = +timeStr.split('m')[0];
    }
  } else if (delimiter === ':') {
    arr = timeStr.split(':');
    time = { h: +arr[0], m: (arr.length > 1 ? +arr[1] : 0) };
  } else {
    time = { h: -1, m: -1 };
  }

  return time;
}

function parseFromDecimal(timeStr = 0.0) {
  var time = { h: 0, m: 0 };
  var d = new Date(0, 0);
  var arr = [];

  d.setMinutes(+timeStr * 60);
  arr = d.toTimeString().split(':');
  time.h = +arr[0];
  time.m = +arr[1];

  return time;
}

function subtractTime(currH = 1, currM = 10, offsetObj = { h: 0, m: 50 }) {
  var result = 'not enough';

          // get multiplier first
        var useMultiplier = Math.max(~~(offsetObj.m / 60), 1);


        Logger.log(useMultiplier);

        if (currH - offsetObj.h < 0) {
          Logger.log(result);
          return;
        }

        // Borrow
        if (currM - offsetObj.m < 0) {
          currH -= useMultiplier; // 1
          if (currH - offsetObj.h < 0) {
            Logger.log(result);
            return;
          } else {
            currM += (60 * useMultiplier);

            if (currM - offsetObj.m < 0) {
              Logger.log(result);
              return;
            }
          }
        }
  /*
  if (currH - offsetObj.h < 0) {
    Logger.log(result);
    return;
  }

  // Borrow 1
  if (currM - offsetObj.m < 0) {
    currH -= 1;
    if (currH - offsetObj.h < 0) {
      Logger.log(result);
      return;
    } else {
      currM += 60;
    }
  }

  */

  Logger.log(currH - offsetObj.h);
  Logger.log(currM - offsetObj.m);
}


function getTypeFromText(text = '') {
  var cleanText = text.toLowerCase().trim().replaceAll(' ','');

  if (cleanText.includes('timein')) {
    return TIME_IN;
  }
  else if (cleanText.includes('timeout')) {
    return TIME_OUT;
  }

  return INVALID_STR;
}

function getTimeFromText(text = '') {
  var searchDigitIndex = text.search(/\d/);

  if (searchDigitIndex > -1) {
    return text.slice(searchDigitIndex);
  }

  return -1;
}

function getTimeObjFromText(text = '1:32 PM') {
  var trimmedText = text.toUpperCase().trim().replaceAll(' ', '');
  var timeObj = {
    'time24hr': '00:00',
    'hour': 0,
    'minute': 0,
    'meridiem': '--',
    'extras': '',
  };

  var pmIndex = trimmedText.indexOf('PM');
  var amIndex = trimmedText.indexOf('AM');
  var isPM = pmIndex > -1;
  var isAM = amIndex > -1;

  if (!isPM && !isAM) {

    // var isNegativeTime = +timeObj.hour < 0 || +timeObj.minute < 0;
    // var isZeroTime = +timeObj.hour === 0 && +timeObj.minute === 0;
    // var isNaNTime =  isNaN(timeObj.hour) || isNaN(timeObj.minute);

    // if (isNegativeTime || isZeroTime || isNaNTime) {
    //   Logger.log('ERROR');
    //   return;
    // }

    return timeObj;
  } else if (isPM || isAM) {
    var timeStr = trimmedText.substring(0, (isPM ? pmIndex : amIndex));
    var mStr = trimmedText.substring(isPM ? pmIndex : amIndex, (isPM ? pmIndex : amIndex) + 2);

    var extras = trimmedText.substring((isPM ? pmIndex : amIndex) + 2);

    var timeArr = timeStr.split(':');
    var hours = +timeArr[0];
    var minutes = timeArr[1];

    if (isPM && hours !== 12) {
      timeStr = (hours + 12) + ':' + minutes; 
    }

    hours += isPM && (hours !== 12 ? 12 : 0);

    if (hours < 10) {
      timeStr = '0' + timeStr;
    }

    timeObj = {
      'time24hr': timeStr,
      'hour': hours,
      'minute': minutes,
      'meridiem': mStr,
      'extras': extras,
    };

    Logger.log(timeObj);

  };

  return timeObj;

}

function getWorkArrangement(text = 'wfh') {
  if (text.includes('wfh')) {
    return WORK_ARRANGEMENTS.WFH;
  } else if (text.includes('onsite')) {
    return WORK_ARRANGEMENTS.ONSITE;
  }
}

function test() {
  var timeSheet = SpreadsheetApp.openById(SSID).getSheetByName(SPREADSHEETS.TIME_SHEET);

  var dataValues = timeSheet.getRange('B3:V19').getValues();
  var hasOldValue = timeSheet.getRange('B3:V19').isBlank();

  

  var rowOffset = hasOldValue ? 21 : 1;

  // if (dataValues.some(value => value === '' || (value == null))) {
  //   rowOffset = 21;
  // }

  Logger.log(rowOffset);
}
