/* =========================
   CupsUp Scheduler - Group Chat Version
   MANUAL ASSIGNMENT ONLY
   ========================= */

const DB_SHEET = {
  SETTINGS: 'Settings',
  EMPLOYEES: 'Employees',
  ASSIGN: 'Assignments',
};

function doGet(e) {
  return HtmlService.createTemplateFromFile('ui')
    .evaluate()
    .setTitle('CupsUp Scheduler')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------- Utilities ---------- */
function getSpreadsheet() {
  return SpreadsheetApp.getActive();
}

function getSheet(name) {
  return getSpreadsheet().getSheetByName(name);
}

function getSettings() {
  const sh = getSheet(DB_SHEET.SETTINGS);
  if (!sh) {
    throw new Error('Settings sheet not found');
  }
  
  const obj = {};
  const lastRow = sh.getLastRow();
  
  if (lastRow < 2) {
    throw new Error('Settings sheet is empty');
  }
  
  const rows = sh.getRange(2, 1, lastRow - 1, 2).getValues();
  rows.forEach(([k, v]) => { 
    if (k) obj[String(k).trim()] = String(v || '').trim(); 
  });
  
  const props = PropertiesService.getScriptProperties();
  obj.TWILIO_SID  = props.getProperty('TWILIO_SID') || '';
  obj.TWILIO_AUTH = props.getProperty('TWILIO_AUTH') || '';
  
  if (!obj.TIMEZONE) obj.TIMEZONE = Session.getScriptTimeZone() || 'America/New_York';
  return obj;
}

function isoDate(d) { 
  return Utilities.formatDate(d, getSettings().TIMEZONE, 'yyyy-MM-dd'); 
}

function isoTime(d) { 
  return Utilities.formatDate(d, getSettings().TIMEZONE, 'HH:mm'); 
}

/* ---------- Calendar ---------- */
function getWeekRange(weekStartIso) {
  const tz = getSettings().TIMEZONE;
  const start = new Date(weekStartIso + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return {start, end, tz};
}

function fetchWeekEvents(weekStartIso) {
  const { start, end } = getWeekRange(weekStartIso);
  const { CALENDAR_ID } = getSettings();
  const cal = CalendarApp.getCalendarById(CALENDAR_ID || 'primary');
  
  if (!cal) {
    throw new Error('Cannot access calendar: ' + CALENDAR_ID);
  }
  
  const events = cal.getEvents(start, end);
  
  return events.map(ev => {
    const loc = (ev.getLocation() || '').trim();
    const { city, state } = parseCityState(loc);
    return {
      id: ev.getId(),
      title: ev.getTitle(),
      date: isoDate(ev.getStartTime()),
      start: isoTime(ev.getStartTime()),
      end: isoTime(ev.getEndTime()),
      city, 
      state,
      locationRaw: loc
    };
  }).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
}

function parseCityState(location) {
  if (!location) return { city: '', state: '' };
  const parts = location.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const state = parts[parts.length - 1].split(' ')[0].toUpperCase().slice(0, 2);
    const city  = parts[parts.length - 2];
    return { city, state };
  }
  return { city: location, state: '' };
}

/* ---------- Employees ---------- */
function listEmployees() {
  const sh = getSheet(DB_SHEET.EMPLOYEES);
  if (!sh) {
    throw new Error('Employees sheet not found');
  }
  
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  
  const rows = sh.getRange(2, 1, lastRow - 1, 4).getValues();
  return rows.filter(r => r[0]).map(([Name, Phone, Role, Notes]) => ({
    Name: String(Name),
    Phone: String(Phone),
    Role: String(Role || ''),
    Notes: String(Notes || '')
  }));
}

/* ---------- Assignments ---------- */
function getAssignments(weekStartIso) {
  const sh = getSheet(DB_SHEET.ASSIGN);
  if (!sh) {
    throw new Error('Assignments sheet not found');
  }
  
  const last = sh.getLastRow();
  if (last < 2) return {};
  
  const rows = sh.getRange(2, 1, last - 1, 10).getValues()
    .filter(r => r[0] === weekStartIso);
  
  // Group by EventId
  const byEvent = {};
  rows.forEach(row => {
    const [weekStart, eventId, title, date, start, end, city, state, assignedData] = row;
  
    if (!byEvent[eventId]) {
      byEvent[eventId] = [];
    }
  
    if (assignedData) {
      const assignments = String(assignedData).split(',').map(s => s.trim()).filter(Boolean);
      assignments.forEach(a => {
        const match = a.match(/^(.+):(\d{2}:\d{2})-(\d{2}:\d{2})$/);
        if (match) {
          byEvent[eventId].push({
            name: match[1].trim(),
            start: match[2],
            end: match[3]
          });
        }
      });
    }
  });
  
  return byEvent;
}

function saveAssignment(weekStartIso, eventId, eventData, assignments) {
  const sh = getSheet(DB_SHEET.ASSIGN);
  if (!sh) {
    throw new Error('Assignments sheet not found');
  }
  
  const last = sh.getLastRow();
  
  // Remove old assignment for this event
  if (last >= 2) {
    const all = sh.getRange(2, 1, last - 1, 10).getValues();
    const keep = all.filter(r => !(r[0] === weekStartIso && r[1] === eventId));
    sh.getRange(2, 1, last - 1, 10).clearContent();
    if (keep.length) sh.getRange(2, 1, keep.length, 10).setValues(keep);
  }
  
  // Save new assignment
  if (assignments && assignments.length > 0) {
    const assignedStr = assignments.map(a => `${a.name}:${a.start}-${a.end}`).join(', ');
    const row = [
      weekStartIso,
      eventId,
      eventData.title,
      eventData.date,
      eventData.start,
      eventData.end,
      eventData.city,
      eventData.state,
      assignedStr,
      ''
    ];
    sh.getRange(sh.getLastRow() + 1, 1, 1, 10).setValues([row]);
  }
  
  return {success: true};
}

/* ---------- Group Chat Message via Twilio ---------- */
function sendGroupChatSchedule(weekStartIso) {
  const settings = getSettings();
  const sid = settings.TWILIO_SID;
  const auth = settings.TWILIO_AUTH;
  const from = settings.TWILIO_FROM;
  const groupNumbers = settings.GROUP_CHAT_NUMBERS;

  if (!sid || !auth || !from) {
    throw new Error('Twilio not configured. Add TWILIO_SID/TWILIO_AUTH in Script Properties and TWILIO_FROM in Settings.');
  }

  if (!groupNumbers) {
    throw new Error('GROUP_CHAT_NUMBERS not set in Settings. Add comma-separated phone numbers.');
  }

  // Get all assignments for the week
  const sh = getSheet(DB_SHEET.ASSIGN);
  const last = sh.getLastRow();
  if (last < 2) {
    throw new Error('No assignments found for this week. Please assign staff first.');
  }
  
  const rows = sh.getRange(2, 1, last - 1, 10).getValues()
    .filter(r => r[0] === weekStartIso);
  
  if (rows.length === 0) {
    throw new Error('No assignments found for this week. Please assign staff first.');
  }

  // Build schedule message
  const weekStart = new Date(weekStartIso + 'T00:00:00');
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const formatDate = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  let message = `â˜• CUPSUP SCHEDULE - ${formatDate(weekStart)} to ${formatDate(weekEnd)}\n\n`;
  
  // Group by date
  const byDate = {};
  rows.forEach(row => {
    const [weekStart, eventId, title, dateISO, start, end, city, state, assignedData] = row;
    if (!byDate[dateISO]) byDate[dateISO] = [];
    byDate[dateISO].push({title, start, end, city, state, assigned: assignedData});
  });

  // Format message
  const dates = Object.keys(byDate).sort();
  dates.forEach(dateISO => {
    const d = new Date(dateISO + 'T00:00:00');
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    message += `ðŸ“… ${days[d.getDay()]} ${formatDate(d)}\n`;
  
    byDate[dateISO].forEach(event => {
      const location = [event.city, event.state].filter(Boolean).join(', ') || 'TBD';
      message += `  ${event.start}-${event.end} ${event.title}\n`;
      message += `  ðŸ“ ${location}\n`;
  
      if (event.assigned) {
        // Parse and format staff
        const staff = event.assigned.split(',').map(s => {
          const match = s.trim().match(/^(.+):(\d{2}:\d{2})-(\d{2}:\d{2})$/);
          return match ? `${match[1]} (${match[2]}-${match[3]})` : s.trim();
        }).join(', ');
        message += `  ðŸ‘¥ ${staff}\n`;
      }
      message += `\n`;
    });
  });

  message += `Reply STOP to unsubscribe`;

  // Send to all group chat numbers
  const numbers = groupNumbers.split(',').map(n => n.trim().replace(/^'+/, '')).filter(Boolean);
  let sent = 0;

  numbers.forEach(toNumber => {
    try {
      twilioSend(sid, auth, from, toNumber, message);
      sent++;
    } catch (e) {
      Logger.log('Failed to send to ' + toNumber + ': ' + e.message);
    }
  });

  // Mark all as sent
  const timestamp = new Date().toISOString();
  rows.forEach((row, idx) => {
    const allRows = sh.getRange(2, 1, last - 1, 1).getValues();
    const rowIndex = allRows.findIndex(x => x[0] === weekStartIso) + 2;
    if (rowIndex >= 2) {
      sh.getRange(rowIndex + idx, 10).setValue('Group chat sent ' + timestamp);
    }
  });

  return {
    count: sent,
    numbers: numbers.length,
    preview: message.substring(0, 200) + '...'
  };
}

function twilioSend(sid, auth, from, to, body) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const payload = {
    To: to,
    From: from,
    Body: body
  };
  const options = {
    method: 'post',
    payload: payload,
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(sid + ':' + auth)
    }
  };
  
  const res = UrlFetchApp.fetch(url, options);
  const code = res.getResponseCode();
  
  if (code >= 300) {
    throw new Error('Twilio error ' + code + ': ' + res.getContentText());
  }
}

/* ---------- API Methods ---------- */
function api_getBootstrap() {
  return {
    settings: getSettings(),
    employees: listEmployees()
  };
}

function api_getWeek(weekStartIso) {
  return {
    events: fetchWeekEvents(weekStartIso),
    assignments: getAssignments(weekStartIso)
  };
}

function api_saveAssignment(weekStartIso, eventId, eventData, assignments) {
  return saveAssignment(weekStartIso, eventId, eventData, assignments);
}

function api_sendGroupChat(weekStartIso) {
  return sendGroupChatSchedule(weekStartIso);
}

/* ---------- AUTOMATED TESTING SCRIPT ---------- */

function runAutomatedTests() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    passed: 0,
    failed: 0,
    warnings: 0
  };

  function addTest(name, status, message, details = '') {
    results.tests.push({name, status, message, details});
    if (status === 'PASS') results.passed++;
    else if (status === 'FAIL') results.failed++;
    else if (status === 'WARN') results.warnings++;
  }

  // Test 1: Sheet Structure
  try {
    const sheets = ['Settings', 'Employees', 'Assignments'];
    sheets.forEach(name => {
      const sh = getSheet(name);
      if (!sh) throw new Error(`Sheet "${name}" not found`);
    });
    addTest('Sheet Structure', 'PASS', 'All required sheets exist');
  } catch (e) {
    addTest('Sheet Structure', 'FAIL', e.message);
  }

  // Test 2: Settings Configuration
  try {
    const settings = getSettings();
    const required = ['CALENDAR_ID', 'TIMEZONE', 'TWILIO_FROM', 'GROUP_CHAT_NUMBERS'];
    const missing = required.filter(k => !settings[k]);
  
    if (missing.length > 0) {
      addTest('Settings Config', 'FAIL', `Missing: ${missing.join(', ')}`);
    } else {
      addTest('Settings Config', 'PASS', 'All settings configured');
    }

    // Validate phone number format
    if (settings.TWILIO_FROM && !settings.TWILIO_FROM.match(/^\+1\d{10}$/)) {
      addTest('TWILIO_FROM Format', 'WARN', 'Should be +1XXXXXXXXXX format', settings.TWILIO_FROM);
    } else {
      addTest('TWILIO_FROM Format', 'PASS', 'Correct format');
    }
  } catch (e) {
    addTest('Settings Config', 'FAIL', e.message);
  }

  // Test 3: Twilio Credentials
  try {
    const settings = getSettings();
    if (!settings.TWILIO_SID || !settings.TWILIO_AUTH) {
      addTest('Twilio Credentials', 'FAIL', 'TWILIO_SID or TWILIO_AUTH not set in Script Properties');
    } else if (settings.TWILIO_SID.length < 30 || settings.TWILIO_AUTH.length < 30) {
      addTest('Twilio Credentials', 'WARN', 'Credentials seem too short, verify they are correct');
    } else {
      addTest('Twilio Credentials', 'PASS', 'Credentials found in Script Properties');
    }
  } catch (e) {
    addTest('Twilio Credentials', 'FAIL', e.message);
  }

  // Test 4: Calendar Access
  try {
    const settings = getSettings();
    const cal = CalendarApp.getCalendarById(settings.CALENDAR_ID);
    if (!cal) throw new Error('Cannot access calendar');
  
    const name = cal.getName();
    addTest('Calendar Access', 'PASS', `Connected to: ${name}`);
  } catch (e) {
    addTest('Calendar Access', 'FAIL', e.message, 'Check calendar permissions');
  }

  // Test 5: Employee Data Validation
  try {
    const employees = listEmployees();
    if (employees.length === 0) {
      addTest('Employee Data', 'FAIL', 'No employees found in Employees sheet');
    } else {
      addTest('Employee Data', 'PASS', `${employees.length} employees loaded`);
  
      // Validate phone numbers
      const invalidPhones = employees.filter(e => !e.Phone.match(/^\+1\d{10}$/));
      if (invalidPhones.length > 0) {
        addTest('Phone Number Format', 'WARN', 
          `${invalidPhones.length} invalid phone numbers`, 
          invalidPhones.map(e => `${e.Name}: ${e.Phone}`).join(', '));
      } else {
        addTest('Phone Number Format', 'PASS', 'All phone numbers valid');
      }
    }
  } catch (e) {
    addTest('Employee Data', 'FAIL', e.message);
  }

  // Test 6: Fetch Events Test
  try {
    const today = new Date();
    const monday = new Date(today);
    const dow = monday.getDay();
    const delta = (dow === 1 ? 0 : (dow === 0 ? -6 : (1 - dow)));
    monday.setDate(monday.getDate() + delta);
    const weekStart = isoDate(monday);
  
    const events = fetchWeekEvents(weekStart);
    addTest('Fetch Events', 'PASS', `Found ${events.length} events for week of ${weekStart}`);
  } catch (e) {
    addTest('Fetch Events', 'FAIL', e.message);
  }

  // Test 7: Group Chat Numbers
  try {
    const settings = getSettings();
    const numbers = settings.GROUP_CHAT_NUMBERS.split(',').map(n => n.trim().replace(/^'+/, '')).filter(Boolean);
  
    if (numbers.length === 0) {
      addTest('Group Chat Setup', 'FAIL', 'No GROUP_CHAT_NUMBERS configured');
    } else {
      addTest('Group Chat Setup', 'PASS', `${numbers.length} recipients configured`);
  
      const invalid = numbers.filter(n => !n.match(/^\+1\d{10}$/));
      if (invalid.length > 0) {
        addTest('Group Chat Number Format', 'WARN', 
          `${invalid.length} invalid numbers`, 
          invalid.join(', '));
      } else {
        addTest('Group Chat Number Format', 'PASS', 'All numbers valid');
      }
    }
  } catch (e) {
    addTest('Group Chat Setup', 'FAIL', e.message);
  }

  // Generate Report
  let report = 'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n';
  report += '   CUPSUP SCHEDULER - TEST RESULTS\n';
  report += 'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n\n';
  report += `Timestamp: ${results.timestamp}\n`;
  report += `Tests Run: ${results.tests.length}\n`;
  report += `âœ… Passed: ${results.passed}\n`;
  report += `âŒ Failed: ${results.failed}\n`;
  report += `âš ï¸  Warnings: ${results.warnings}\n\n`;
  
  report += 'â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n';
  report += 'DETAILED RESULTS:\n';
  report += 'â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n\n';
  
  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? 'âœ…' : (test.status === 'WARN' ? 'âš ï¸' : 'âŒ');
    report += `${icon} ${test.name}: ${test.message}\n`;
    if (test.details) report += `   â””â”€ ${test.details}\n`;
  });
  
  report += '\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n';
  if (results.failed === 0) {
    report += 'ðŸŽ‰ ALL CRITICAL TESTS PASSED!\n';
    report += 'System is ready for deployment.\n';
  } else {
    report += 'ðŸš« SYSTEM NOT READY FOR DEPLOYMENT\n';
    report += 'Fix all failed tests before going live.\n';
  }
  report += 'â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n';
  
  Logger.log(report);
  return {results, report};
}
/* =========================
   ADD THIS TO YOUR Code.gs
   Custom Menu with Test Functions
   ========================= */

// This runs automatically when the spreadsheet opens
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('ðŸ§ª CupsUp Tests')
    .addItem('1ï¸âƒ£ Test Settings Load', 'test_settings')
    .addItem('2ï¸âƒ£ Test Employee Load', 'test_employees')
    .addItem('3ï¸âƒ£ Test Calendar Access', 'test_calendar')
    .addItem('4ï¸âƒ£ Test Twilio Credentials', 'test_twilio_creds')
    .addSeparator()
    .addItem('5ï¸âƒ£ Test Fetch This Week', 'test_fetch_week')
    .addItem('6ï¸âƒ£ Test Group Chat Numbers', 'test_group_numbers')
    .addSeparator()
    .addItem('ðŸš€ RUN ALL TESTS', 'runAutomatedTests')
    .addSeparator()
    .addItem('ðŸ“± Send TEST Message (YOUR # ONLY)', 'test_send_to_me')
    .addToUi();
}

/* ---------- Individual Test Functions ---------- */

function test_settings() {
  try {
    const settings = getSettings();
    const ui = SpreadsheetApp.getUi();
  
    let report = 'âœ… SETTINGS LOADED SUCCESSFULLY\n\n';
    report += `Calendar: ${settings.CALENDAR_ID}\n`;
    report += `Timezone: ${settings.TIMEZONE}\n`;
    report += `Twilio From: ${settings.TWILIO_FROM}\n`;
    report += `Group Chat: ${settings.GROUP_CHAT_NUMBERS ? settings.GROUP_CHAT_NUMBERS.substring(0, 50) + '...' : 'NOT SET'}\n\n`;
  
    // Check for missing settings
    const required = ['CALENDAR_ID', 'TIMEZONE', 'TWILIO_FROM', 'GROUP_CHAT_NUMBERS'];
    const missing = required.filter(k => !settings[k]);
  
    if (missing.length > 0) {
      report += `âš ï¸  Missing: ${missing.join(', ')}`;
      ui.alert('Settings Test', report, ui.ButtonSet.OK);
    } else {
      report += 'âœ… All required settings present!';
      ui.alert('âœ… Settings Test Passed', report, ui.ButtonSet.OK);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('âŒ Settings Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_employees() {
  try {
    const employees = listEmployees();
    const ui = SpreadsheetApp.getUi();
  
    if (employees.length === 0) {
      ui.alert('âŒ Employee Test Failed', 'No employees found in Employees sheet', ui.ButtonSet.OK);
      return;
    }
  
    let report = `âœ… LOADED ${employees.length} EMPLOYEES\n\n`;
  
    employees.forEach(emp => {
      const phoneValid = emp.Phone.match(/^\+1\d{10}$/);
      const icon = phoneValid ? 'âœ…' : 'âŒ';
      report += `${icon} ${emp.Name}: ${emp.Phone}\n`;
    });
  
    const invalidCount = employees.filter(e => !e.Phone.match(/^\+1\d{10}$/)).length;
  
    if (invalidCount > 0) {
      report += `\nâš ï¸  ${invalidCount} invalid phone number(s)`;
    } else {
      report += '\nâœ… All phone numbers valid!';
    }
  
    ui.alert('Employee Test', report, ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('âŒ Employee Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_calendar() {
  try {
    const settings = getSettings();
    const cal = CalendarApp.getCalendarById(settings.CALENDAR_ID);
    const ui = SpreadsheetApp.getUi();
  
    if (!cal) {
      ui.alert('âŒ Calendar Test Failed', 
        `Cannot access calendar: ${settings.CALENDAR_ID}\n\nCheck permissions!`, 
        ui.ButtonSet.OK);
      return;
    }
  
    const name = cal.getName();
    const timezone = cal.getTimeZone();
  
    let report = 'âœ… CALENDAR ACCESS SUCCESSFUL\n\n';
    report += `Calendar Name: ${name}\n`;
    report += `Calendar ID: ${settings.CALENDAR_ID}\n`;
    report += `Timezone: ${timezone}\n`;
  
    ui.alert('âœ… Calendar Test Passed', report, ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('âŒ Calendar Test Failed', 
      `Error: ${e.message}\n\nMake sure calendar is shared with your account!`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_twilio_creds() {
  try {
    const settings = getSettings();
    const ui = SpreadsheetApp.getUi();
  
    let report = 'TWILIO CREDENTIALS CHECK\n\n';
  
    if (!settings.TWILIO_SID) {
      report += 'âŒ TWILIO_SID not found in Script Properties\n';
    } else if (settings.TWILIO_SID.length < 30) {
      report += 'âš ï¸  TWILIO_SID seems too short\n';
      report += `   Length: ${settings.TWILIO_SID.length} characters\n`;
    } else {
      report += 'âœ… TWILIO_SID found\n';
      report += `   Format: ${settings.TWILIO_SID.substring(0, 10)}...\n`;
    }
  
    if (!settings.TWILIO_AUTH) {
      report += 'âŒ TWILIO_AUTH not found in Script Properties\n';
    } else if (settings.TWILIO_AUTH.length < 30) {
      report += 'âš ï¸  TWILIO_AUTH seems too short\n';
      report += `   Length: ${settings.TWILIO_AUTH.length} characters\n`;
    } else {
      report += 'âœ… TWILIO_AUTH found\n';
      report += `   Format: ${settings.TWILIO_AUTH.substring(0, 10)}...\n`;
    }
  
    if (!settings.TWILIO_FROM) {
      report += 'âŒ TWILIO_FROM not in Settings sheet\n';
    } else if (!settings.TWILIO_FROM.match(/^\+1\d{10}$/)) {
      report += 'âš ï¸  TWILIO_FROM format invalid\n';
      report += `   Value: ${settings.TWILIO_FROM}\n`;
      report += '   Should be: +1XXXXXXXXXX\n';
    } else {
      report += 'âœ… TWILIO_FROM configured\n';
      report += `   Number: ${settings.TWILIO_FROM}\n`;
    }
  
    report += '\n';
  
    const allGood = settings.TWILIO_SID && 
                    settings.TWILIO_AUTH && 
                    settings.TWILIO_FROM &&
                    settings.TWILIO_SID.length >= 30 &&
                    settings.TWILIO_AUTH.length >= 30 &&
                    settings.TWILIO_FROM.match(/^\+1\d{10}$/);
  
    if (allGood) {
      report += 'âœ… Twilio is fully configured!\n\nReady to send messages.';
      ui.alert('âœ… Twilio Test Passed', report, ui.ButtonSet.OK);
    } else {
      report += 'âš ï¸  Twilio not fully configured\n\nFix the issues above before sending messages.';
      ui.alert('âš ï¸  Twilio Configuration Incomplete', report, ui.ButtonSet.OK);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('âŒ Twilio Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_fetch_week() {
  try {
    const ui = SpreadsheetApp.getUi();
  
    // Get current Monday
    const today = new Date();
    const monday = new Date(today);
    const dow = monday.getDay();
    const delta = (dow === 1 ? 0 : (dow === 0 ? -6 : (1 - dow)));
    monday.setDate(monday.getDate() + delta);
    const weekStart = isoDate(monday);
  
    const events = fetchWeekEvents(weekStart);
  
    let report = `âœ… FETCHED EVENTS FOR WEEK OF ${weekStart}\n\n`;
    report += `Found ${events.length} event(s)\n\n`;
  
    if (events.length === 0) {
      report += 'âš ï¸  No events found this week\n';
      report += 'Add events to calendar to test further';
    } else {
      events.slice(0, 5).forEach(ev => {
        report += `ðŸ“… ${ev.date} ${ev.start}-${ev.end}\n`;
        report += `   ${ev.title}\n`;
        if (ev.city || ev.state) {
          report += `   ðŸ“ ${ev.city}, ${ev.state}\n`;
        }
        report += '\n';
      });
  
      if (events.length > 5) {
        report += `... and ${events.length - 5} more event(s)`;
      }
    }
  
    ui.alert('âœ… Fetch Week Test Passed', report, ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('âŒ Fetch Week Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_group_numbers() {
  try {
    const settings = getSettings();
    const ui = SpreadsheetApp.getUi();
  
    if (!settings.GROUP_CHAT_NUMBERS) {
      ui.alert('âŒ Group Numbers Test Failed', 
        'GROUP_CHAT_NUMBERS not set in Settings sheet', 
        ui.ButtonSet.OK);
      return;
    }
  
    const numbers = settings.GROUP_CHAT_NUMBERS.split(',').map(n => n.trim().replace(/^'+/, '')).filter(Boolean);
  
    let report = `âœ… PARSED ${numbers.length} PHONE NUMBERS\n\n`;
  
    numbers.forEach((num, idx) => {
      const valid = num.match(/^\+1\d{10}$/);
      const icon = valid ? 'âœ…' : 'âŒ';
      report += `${icon} ${idx + 1}. ${num}\n`;
    });
  
    const invalidCount = numbers.filter(n => !n.match(/^\+1\d{10}$/)).length;
  
    report += '\n';
  
    if (invalidCount > 0) {
      report += `âš ï¸  ${invalidCount} invalid number(s)\n`;
      report += 'Fix format to: +1XXXXXXXXXX';
      ui.alert('âš ï¸  Group Numbers Have Issues', report, ui.ButtonSet.OK);
    } else {
      report += `âœ… All ${numbers.length} numbers are valid!`;
      ui.alert('âœ… Group Numbers Test Passed', report, ui.ButtonSet.OK);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('âŒ Group Numbers Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_send_to_me() {
  const ui = SpreadsheetApp.getUi();
  
  // Warning dialog
  const response = ui.alert(
    'âš ï¸  SEND TEST MESSAGE',
    'This will send a test SMS.\n\n' +
    'Make sure GROUP_CHAT_NUMBERS in Settings\n' +
    'is set to YOUR PHONE NUMBER ONLY!\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  try {
    const settings = getSettings();
    const sid = settings.TWILIO_SID;
    const auth = settings.TWILIO_AUTH;
    const from = settings.TWILIO_FROM;
    const numbers = settings.GROUP_CHAT_NUMBERS.split(',').map(n => n.trim().replace(/^'+/, '')).filter(Boolean);
  
    if (!sid || !auth || !from) {
      ui.alert('âŒ Cannot Send', 'Twilio credentials not configured', ui.ButtonSet.OK);
      return;
    }
  
    if (numbers.length > 1) {
      ui.alert('âš ï¸  WARNING', 
        `You have ${numbers.length} numbers in GROUP_CHAT_NUMBERS.\n\n` +
        'This will send to ALL of them.\n\n' +
        'For testing, set GROUP_CHAT_NUMBERS to ONLY YOUR number first!',
        ui.ButtonSet.OK);
      return;
    }
  
    const testMessage = `ðŸ§ª CupsUp Scheduler Test\n\n` +
                       `Sent: ${new Date().toLocaleString()}\n` +
                       `From: ${from}\n\n` +
                       `âœ… Your system is working!\n\n` +
                       `Reply STOP to unsubscribe`;
  
    twilioSend(sid, auth, from, numbers[0], testMessage);
  
    ui.alert('âœ… Test Message Sent!', 
      `Message sent to: ${numbers[0]}\n\n` +
      'Check your phone within 60 seconds.\n\n' +
      'If you receive it, Twilio is working!',
      ui.ButtonSet.OK);
  
  } catch (e) {
    ui.alert('âŒ Send Test Failed', 
      `Error: ${e.message}\n\n` +
      'Check Twilio credentials and account balance.',
      ui.ButtonSet.OK);
  }
}