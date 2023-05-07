function addTimeIn({ botChatId, sender, timeStr }) {
    sendMessage(botChatId, 'Hi ' + sender + '!%0AYou have <u>timed in</u> at 「<b>'+ timeStr + '</b>🟢」.%0A%0ASelect your work arrangement for today:', { reply_markup: {
        inline_keyboard: [
            [{text: '🏠 WFH', 'callback_data': 'w_' + timeStr}],
            [{text: '🏢 Onsite', 'callback_data': 'o_' + timeStr}],
        ],
        } });
}

function addTimeOut({ botChatId, groupChatId, senderId, sender, timeStr, isWfh, isTimeIn }) {
    var TIME_LOG_SHEET = SpreadsheetApp.openById(SSID).getSheetByName(SPREADSHEETS.TIMELOGS);
    var data = readDataFromRange(SPREADSHEETS.TIMELOGS, 'A2', 'G');
    var headers = data[0];
    var knoxId = getKnoxId(senderId);
    var knoxIdColumnIndex = headers.indexOf(TIMELOG_TABLE.KNOX_ID);
    var timeInColumnIndex = headers.indexOf(TIMELOG_TABLE.TIME_IN);
    var timeOutColumnIndex = headers.indexOf(TIMELOG_TABLE.TIME_OUT);
    var lastTimeLogRow = data.reverse().find(function (timeLog) {
        return timeLog[knoxIdColumnIndex] === knoxId;
    });
    var lastTimeIn = lastTimeLogRow[timeInColumnIndex];

    if (!lastTimeLogRow || !lastTimeIn) {
        sendMessage(botChatId, 'Oops! We can\'t find your time in record, ' + sender +'. 😔%0A' + 
        'Please send your time in first by using <code>/time_in</code>.')
    } else {
        TIME_LOG_SHEET.getRange(lastTimeLogRow, timeOutColumnIndex).setValue(timeStr);

        sendMessage(botChatId, generateBotMessageToGroup(sender, timeStr, isWfh, isTimeIn));
        sendMessage(groupChatId, generateBotMessageToGroup(knoxId, timeStr, isWfh, isTimeIn));
    }
}

function addMember({ senderId }) {
    var role = getUserRole(senderId);

    if (role < ROLES.ADMIN) {
        sendMessage(senderId, 'Sorry, only members with Admin access can use this command.' +
            'You may request for Admin access from your manager.' );
        return;
    }
}

function removeMember({ senderId }) {
    var role = getUserRole(senderId);

    if (role < ROLES.ADMIN) {
        sendMessage(senderId, 'Sorry, only members with Admin access can use this command.' +
            'You may request for Admin access from your manager.' );
        return;
    }
}

function addAdmin({ senderId }) {
    var role = getUserRole(senderId);

    if (role !== ROLES.SUPER_ADMIN) {
        sendMessage(senderId, 'Sorry, only members with Super Admin access can use this command.' +
            'You may request for Super Admin access from your manager.' );
        return;
    }
}

function removeAdmin({ senderId }) {
    var role = getUserRole(senderId);

    if (role !== ROLES.SUPER_ADMIN) {
        sendMessage(senderId, 'Sorry, only members with Super Admin access can use this command.' +
            'You may request for Super Admin access from your manager.' );
        return;
    }
}

function addSuperAdmin({ senderId }) {
    var role = getUserRole(senderId);
    
    if (role !== ROLES.SUPER_ADMIN) {
        sendMessage(senderId, 'Sorry, only members with Super Admin access can use this command.' +
            'You may request for Super Admin access from your manager.' );
        return;
    }
}

function removeSuperAdmin({ senderId }) {
    var role = getUserRole(senderId);

    if (role !== ROLES.SUPER_ADMIN) {
        sendMessage(senderId, 'Sorry, only members with Super Admin access can use this command.' +
            'You may request for Super Admin access from your manager.' );
        return;
    }
}

function getTimeSheet({ knoxIdFromAdmin, senderId, botChatId, argStartdate, argEndDate }) {
    var role = getUserRole(senderId);
    if (role !== ROLES.SUPER_ADMIN) {
        sendMessage(senderId, 'Sorry, only members with Super Admin access can use this command.' +
            'You may do any of the following: %0A%0A' +
            '- Send <code>/my_timesheet</code> to Clockmon to get your timesheet.%0A' + 
            '- Request for Super Admin access from your manager.' );
        return;
    }

    // see format at the end of the function
    var data = readDataFromRange(SPREADSHEETS.TIMELOGS, 'A2', 'G');
    var headers = data[0];
    var knoxIdColumnIndex = headers.indexOf(TIMELOG_TABLE.KNOX_ID);
    var dateColumnIndex = headers.indexOf(TIMELOG_TABLE.DATE);
    var workArrangementColumnIndex = headers.indexOf(TIMELOG_TABLE.WORK_ARRANGEMENT);
    var timeInColumnIndex = headers.indexOf(TIMELOG_TABLE.TIME_IN);
    var timeOutColumnIndex = headers.indexOf(TIMELOG_TABLE.TIME_OUT);

    var knoxId = knoxIdFromAdmin ? knoxIdFromAdmin : getKnoxId(senderId);
    if (!knoxId) {
        sendMessage(senderId, 'We cannot find the Knox ID of the member you\'re looking for. ' + 
            'Please try again.');
        return;
    }

    var startDate = argStartdate ? argStartdate : getDate() - FOUR_WEEKS_AGO;
    var endDate = argEndDate ? argEndDate : getDate();
    var totalHoursWeek = 0;
    var totalWfhDays = 0;
    var totalOnsiteDays = 0;
    var totalInsufficientLog = 0;
    var totalHours = 0;

    var timetable = '📅 Timesheet for ' + knoxId + ' from ' + startDate + ' to ' + endDate + '%0A%0A';

    var filteredData = data.filter(function (timeLog) {
        var timeLogKnoxId = timeLog[knoxIdColumnIndex];
        var timeLogDate = timeLog[dateColumnIndex];
        return timeLogKnoxId === knoxId && timeLogDate >= startDate && timeLogDate <= endDate;
    });

    filteredData.forEach(function(timeLog, index) {
        var date = timeLog[dateColumnIndex];
        var day = date.getDay();

        var timeIn = timeLog[timeInColumnIndex];
        var timeOut = timeLog[timeOutColumnIndex];
        var totalMs = timeIn && timeOut ? Math.abs(timeOut - timeIn) : 0;
        var timeLogHours = totalMs / 1000 / 3600;
        var hoursText = ' (' + (!timeOut ? 'No time out' : timeLogHours + 'hours') + ')';
        var workArrangement = !timeIn ? 'No time in' : timeLog[workArrangementColumnIndex];

        if (index > 0 && (day === 0 || day === 1)) {
            timetable += '-------------------------%0A';
            timetable += 'Subtotal hours: ' + totalHoursWeek + ' hours %0A%0A';
            totalHoursWeek = 0;
        }

        timeTable += '- ' + date + ', ' + DAY_OF_WEEK[day] + ': ' + workArrangement + hoursText + '%0A';

        totalHoursWeek += timeLogHours ? timeLogHours : 0;
        totalWfhDays += workArrangement ? WORK_ARRANGEMENTS.WFH : 0;
        totalOnsiteDays += workArrangement ? WORK_ARRANGEMENTS.ONSITE : 0;
        totalInsufficientLog += !timeIn || !timeOut ? 1 : 0;
        totalHours += timeLogHours ? timeLogHours : 0;
    });

    timetable += 'Totals %0A';
    timetable += '- WFH: ' + totalWfhDays + ' day(s)';
    timetable += '- Onsite: ' + totalOnsiteDays + ' day(s)';
    timetable += '- No time in or out: ' + totalInsufficientLog + ' day(s)';
    timetable += '- Rendered hours: ' + totalHours + ' hours';

    sendMessage(botChatId, timetable);

    /**
     * Timesheet for kg.ramos from 03/01/2023 to 03/31/2023
     * 
     * - 02/27, Mon: No time in
     * - 02/28, Tue: No time in
     * - 03/01, Wed: WFH (8 hours)
     * - 03/02, Thu: WFH (10 hours)
     * - 03/03, Fri: WFH (10 hours)
     * -------------------------
     * Subtotal hours: 28 hours
     * 
     * - 03/06, Mon: Onsite (8 hours)
     * - 03/07, Tue: Onsite (8 hours)
     * - 03/08, Wed: Onsite (8 hours)
     * - 03/09, Thu: WFH (no time out)
     * - 03/10, Fri: WFH (8 hours)
     * -------------------------
     * Subtotal hours: 32 hours
     * 
     * Totals
     * - Onsite: 3 days
     * - WFH: 3 days
     * - No time in or out: 1 day
     * - Rendered hours: 60 hours
     */
}

function getTotalDaysAll({ botChatId, isWfh }) {
    if (role !== ROLES.SUPER_ADMIN) {
        sendMessage(senderId, 'Sorry, only members with Super Admin access can use this command.' +
            'You may do any of the following: %0A%0A' +
            '- Send <code>/my_timesheet</code> to Clockmon to get your timesheet.%0A' + 
            '- Request for Super Admin access from your manager.' );
        return;
    }

    var data = readDataFromRange(SPREADSHEETS.TIMELOGS, 'A2', 'G');
    var headers = data[0];
    var workArrangementColumnIndex = headers.indexOf(TIMELOGS_TABLE.WORK_ARRANGEMENT);
    var workArrangement = isWfh ? WORK_ARRANGEMENTS.WFH : WORK_ARRANGEMENTS.ONSITE;

    var totalWfhDays = data.reduce(function (total, timeLog){
        return total + (timeLog[workArrangementColumnIndex] === workArrangement) ? 1 : 0;
    });

    sendmessage(botChatId, '📅 Total ' + workArrangement + ' days: ' + totalWfhDays);
}



function showFormats({ botChatId }) {
    sendMessage(botChatId, MESSAGES.FORMATS);
}

function showHelp({ botChatId }) {
    sendMessage(botChatId, MESSAGES.HELP);
}

function showAbout({ botChatId }) {
    sendMessage(botChatId, MESSAGES.ABOUT);
}
