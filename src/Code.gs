/* =========================
   CupsUp Scheduler - Enhanced Version
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
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMo
     de.DENY);
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
    throw new Error('Settings sheet not found. Please create a "Settings" tab.');
  }

  const obj = {};
  const lastRow = sh.getLastRow();

  if (lastRow < 2) {
    throw new Error('Settings sheet is empty. Please add configuration values.');
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

  if (!CALENDAR_ID) {
    throw new Error('CALENDAR_ID not set in Settings sheet. Please add calendar email address.');
  }

  const cal = CalendarApp.getCalendarById(CALENDAR_ID || 'primary');

  if (!cal) {
    throw new Error(`Cannot access calendar: ${CALENDAR_ID}. Please check sharing permissions.`);
  }

  try {
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
  } catch (e) {
    throw new Error(`Calendar error: ${e.message}. Check that calendar is shared with edit permissions.`);
  }
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
    throw new Error('Employees sheet not found. Please create an "Employees" tab.');
  }

  const lastRow = sh.getLastRow();
  if (lastRow < 2) {
    throw new Error('No employees found. Please add employees to the Employees sheet.');
  }

  const rows = sh.getRange(2, 1, lastRow - 1, 4).getValues();
  const employees = rows.filter(r => r[0]).map(([Name, Phone, Role, Notes]) => {
    // Clean phone number
    const cleanPhone = String(Phone).trim().replace(/^'+/, '').replace(/\s+/g, '');

    return {
      Name: String(Name).trim(),
      Phone: cleanPhone,
      Role: String(Role || '').trim(),
      Notes: String(Notes || '').trim()
    };
  });

  // Validate phone numbers
  const invalidPhones = employees.filter(e => !e.Phone.match(/^\+1\d{10}$/));
  if (invalidPhones.length > 0) {
    const names = invalidPhones.map(e => `${e.Name} (${e.Phone})`).join(', ');
    Logger.log(`Warning: Invalid phone numbers for: ${names}`);
  }

  return employees;
}

/* ---------- Assignments ---------- */
function getAssignments(weekStartIso) {
  const sh = getSheet(DB_SHEET.ASSIGN);
  if (!sh) {
    // Create Assignments sheet if it doesn't exist
    const ss = getSpreadsheet();
    const newSheet = ss.insertSheet(DB_SHEET.ASSIGN);
    newSheet.getRange(1, 1, 1, 10).setValues([[
      'WeekStart', 'EventId', 'EventTitle', 'Date', 'Start', 'End', 'City', 'State', 'Assigned', 'SMSStatus'
    ]]);
    return {};
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
    throw new Error('Assignments sheet not found.');
  }

  // Validate assignments
  if (assignments && assignments.length > 0) {
    // Validate assignment count
    if (assignments.length > 10) {
      throw new Error('Maximum 10 staff assignments per event. Please reduce assignments.');
    }

    assignments.forEach((a, idx) => {
      if (!a.name) throw new Error(`Assignment ${idx + 1}: Employee name is required`);
      if (!a.start || !a.end) throw new Error(`Assignment ${idx + 1}: Start and end times are required`);

      // Validate name length
      if (a.name.length > 50) {
        throw new Error(`Assignment ${idx + 1}: Employee name too long (${a.name.length} chars). Maximum 50 characters.`);
      }

      // Validate time format
      if (!a.start.match(/^\d{2}:\d{2}$/) || !a.end.match(/^\d{2}:\d{2}$/)) {
        throw new Error(`Assignment ${idx + 1}: Invalid time format. Use HH:MM`);
      }

      // Validate time logic
      if (a.start >= a.end) {
        throw new Error(`Assignment ${idx + 1}: Start time must be before end time`);
      }
    });
  }

  // Validate event title length
  if (eventData.title && eventData.title.length > 100) {
    throw new Error(`Event title too long (${eventData.title.length} chars). Maximum 100 characters.`);
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
      eventData.city || '',
      eventData.state || '',
      assignedStr,
      '' // SMSStatus - will be updated when group chat sent
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

  // Validate Twilio configuration
  if (!sid || !auth) {
    throw new Error('Twilio credentials not configured. Add TWILIO_SID and TWILIO_AUTH to Script Properties (not the Settings sheet).');
  }

  if (!from) {
    throw new Error('TWILIO_FROM not set in Settings sheet. Add your Twilio phone number.');
  }

  if (!from.match(/^\+1\d{10}$/)) {
    throw new Error(`Invalid TWILIO_FROM format: ${from}. Must be +1XXXXXXXXXX`);
  }

  if (!groupNumbers) {
    throw new Error('GROUP_CHAT_NUMBERS not set in Settings sheet. Add comma-separated phone numbers.');
  }

  // Validate and parse phone numbers
  const numbers = groupNumbers
    .split(',')
    .map(n => n.trim().replace(/^'+/, '').replace(/\s+/g, ''))
    .filter(Boolean);

  const invalidNumbers = numbers.filter(n => !n.match(/^\+1\d{10}$/));
  if (invalidNumbers.length > 0) {
    throw new Error(`Invalid phone number format: ${invalidNumbers.join(', ')}. All numbers must be +1XXXXXXXXXX`);
  }

  if (numbers.length === 0) {
    throw new Error('No valid phone numbers found in GROUP_CHAT_NUMBERS.');
  }

  // ENHANCEMENT 1: Check daily send limit (10 per day)
  const props = PropertiesService.getScriptProperties();
  const today = new Date().toISOString().slice(0, 10);
  const dailySends = parseInt(props.getProperty('SENDS_' + today) || '0');

  if (dailySends >= 10) {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const hoursUntilReset = Math.ceil((midnight - now) / (1000 * 60 * 60));
    throw new Error(`Daily send limit reached (10/day). Limit resets in ${hoursUntilReset} hours at midnight.`);
  }

  // ENHANCEMENT 2: Validate recipient count (max 50)
  const MAX_RECIPIENTS = 50;
  if (numbers.length > MAX_RECIPIENTS) {
    throw new Error(`Too many recipients (${numbers.length}). Maximum ${MAX_RECIPIENTS} allowed per send.`);
  }

  // Get all assignments for the week
  const sh = getSheet(DB_SHEET.ASSIGN);
  const last = sh.getLastRow();
  if (last < 2) {
    throw new Error('No assignments found for this week. Please assign staff to events before sending group chat.');
  }

  const rows = sh.getRange(2, 1, last - 1, 10).getValues()
    .filter(r => r[0] === weekStartIso);

  if (rows.length === 0) {
    throw new Error('No assignments found for this week. Please assign staff to events before sending group chat.');
  }

  // Build schedule message
  const weekStart = new Date(weekStartIso + 'T00:00:00');
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatDate = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  let message = `☕ CUPSUP SCHEDULE - ${formatDate(weekStart)} to ${formatDate(weekEnd)}\n\n`;

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
    message += `📅 ${days[d.getDay()]} ${formatDate(d)}\n`;

    byDate[dateISO].forEach(event => {
      const location = [event.city, event.state].filter(Boolean).join(', ') || 'TBD';
      message += `  ${event.start}-${event.end} ${event.title}\n`;
      message += `  📍 ${location}\n`;

      if (event.assigned) {
        // Parse and format staff
        const staff = event.assigned.split(',').map(s => {
          const match = s.trim().match(/^(.+):(\d{2}:\d{2})-(\d{2}:\d{2})$/);
          return match ? `${match[1]} (${match[2]}-${match[3]})` : s.trim();
        }).join(', ');
        message += `  👥 ${staff}\n`;
      }
      message += `\n`;
    });
  });

  message += `Reply STOP to unsubscribe`;

  // ENHANCEMENT 3: Validate message size (max 1600 characters = 10 SMS segments)
  const MAX_MESSAGE_LENGTH = 1600;
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too large (${message.length} characters). Maximum ${MAX_MESSAGE_LENGTH} characters allowed (10 SMS segments). Please reduce the schedule size.`);
  }

  // ENHANCEMENT 4: Calculate SMS segments and estimated cost
  const SMS_SEGMENT_SIZE = 160;
  const COST_PER_MESSAGE = 0.0079; // Twilio US pricing
  const segments = Math.ceil(message.length / SMS_SEGMENT_SIZE);
  const totalMessages = numbers.length * segments;
  const estimatedCost = (totalMessages * COST_PER_MESSAGE).toFixed(2);

  // Log message size info
  Logger.log(`Message size: ${message.length} characters, ${segments} SMS segment(s)`);
  Logger.log(`Recipients: ${numbers.length}, Total messages: ${totalMessages}, Estimated cost: $${estimatedCost}`);

  // ENHANCEMENT 5: Warning for multi-segment messages
  if (segments > 1) {
    Logger.log(`WARNING: Message will be split into ${segments} SMS segments. Each recipient will receive ${segments} messages.`);
  }

  // ENHANCEMENT 6: Warning for large sends (>20 recipients)
  if (numbers.length > 20) {
    Logger.log(`LARGE SEND WARNING: ${numbers.length} recipients, ~$${estimatedCost} estimated cost`);
  }

  // Rate limiting check (prevent spam) - 60 second cooldown
  const lastSend = props.getProperty('LAST_GROUP_CHAT_SEND');
  if (lastSend) {
    const timeSince = Date.now() - parseInt(lastSend);
    if (timeSince < 60000) { // 1 minute cooldown
      throw new Error(`Rate limit: Please wait ${Math.ceil((60000 - timeSince) / 1000)} seconds before sending another group chat.`);
    }
  }

  // Send to all group chat numbers
  let sent = 0;
  const errors = [];

  numbers.forEach(toNumber => {
    try {
      twilioSend(sid, auth, from, toNumber, message);
      sent++;
    } catch (e) {
      Logger.log('Failed to send to ' + toNumber + ': ' + e.message);
      errors.push(`${toNumber}: ${e.message}`);
    }
  });

  // Update rate limit timestamp
  props.setProperty('LAST_GROUP_CHAT_SEND', Date.now().toString());

  // ENHANCEMENT 7: Update daily counter after successful send
  props.setProperty('SENDS_' + today, (dailySends + 1).toString());

  // Mark all as sent (or log errors)
  const timestamp = new Date().toISOString();
  const statusText = errors.length > 0
    ? `Group chat sent ${timestamp} (${errors.length} failed)`
    : `Group chat sent ${timestamp}`;

  rows.forEach((row, idx) => {
    const allRows = sh.getRange(2, 1, last - 1, 1).getValues();
    const rowIndex = allRows.findIndex(x => x[0] === weekStartIso) + 2;
    if (rowIndex >= 2) {
      sh.getRange(rowIndex + idx, 10).setValue(statusText);
    }
  });

  if (errors.length > 0) {
    Logger.log('Group chat errors: ' + JSON.stringify(errors));
  }

  return {
    count: sent,
    numbers: numbers.length,
    segments: segments,
    messageLength: message.length,
    totalMessages: totalMessages,
    estimatedCost: estimatedCost,
    dailySendsRemaining: 9 - dailySends,
    preview: message.substring(0, 200) + '...',
    errors: errors.length > 0 ? errors : undefined
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
    const errorBody = res.getContentText();
    let errorMsg = `Twilio API error ${code}`;

    // Parse Twilio error for better messages
    try {
      const errorData = JSON.parse(errorBody);
      if (errorData.message) {
        errorMsg += `: ${errorData.message}`;
      }
      if (errorData.code === 21211) {
        errorMsg += ' - Invalid "From" phone number. Check TWILIO_FROM in Settings.';
      } else if (errorData.code === 21614) {
        errorMsg += ' - Invalid "To" phone number format.';
      } else if (errorData.code === 20003) {
        errorMsg += ' - Authentication failed. Check TWILIO_SID and TWILIO_AUTH in Script Properties.';
      }
    } catch (e) {
      errorMsg += `: ${errorBody}`;
    }

    throw new Error(errorMsg);
  }
}

/* ---------- API Methods ---------- */
function api_getBootstrap() {
  try {
    return {
      settings: getSettings(),
      employees: listEmployees()
    };
  } catch (e) {
    throw new Error(`Bootstrap failed: ${e.message}`);
  }
}

function api_getWeek(weekStartIso) {
  try {
    return {
      events: fetchWeekEvents(weekStartIso),
      assignments: getAssignments(weekStartIso)
    };
  } catch (e) {
    throw new Error(`Failed to load week: ${e.message}`);
  }
}

function api_saveAssignment(weekStartIso, eventId, eventData, assignments) {
  try {
    return saveAssignment(weekStartIso, eventId, eventData, assignments);
  } catch (e) {
    throw new Error(`Failed to save assignment: ${e.message}`);
  }
}

function api_sendGroupChat(weekStartIso) {
  try {
    return sendGroupChatSchedule(weekStartIso);
  } catch (e) {
    throw new Error(`Failed to send group chat: ${e.message}`);
  }
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
    const numbers = settings.GROUP_CHAT_NUMBERS
      .split(',')
      .map(n => n.trim().replace(/^'+/, '').replace(/\s+/g, ''))
      .filter(Boolean);

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
  let report = '═══════════════════════════════════════\n';
  report += '   CUPSUP SCHEDULER - TEST RESULTS\n';
  report += '═══════════════════════════════════════\n\n';
  report += `Timestamp: ${results.timestamp}\n`;
  report += `Tests Run: ${results.tests.length}\n`;
  report += `✅ Passed: ${results.passed}\n`;
  report += `❌ Failed: ${results.failed}\n`;
  report += `⚠️  Warnings: ${results.warnings}\n\n`;

  report += '───────────────────────────────────────\n';
  report += 'DETAILED RESULTS:\n';
  report += '───────────────────────────────────────\n\n';

  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : (test.status === 'WARN' ? '⚠️' : '❌');
    report += `${icon} ${test.name}: ${test.message}\n`;
    if (test.details) report += `   └─ ${test.details}\n`;
  });

  report += '\n───────────────────────────────────────\n';
  if (results.failed === 0) {
    report += '🎉 ALL CRITICAL TESTS PASSED!\n';
    report += 'System is ready for deployment.\n';
  } else {
    report += '🚫 SYSTEM NOT READY FOR DEPLOYMENT\n';
    report += 'Fix all failed tests before going live.\n';
  }
  report += '───────────────────────────────────────\n';

  Logger.log(report);
  return {results, report};
}

/* =========================
   Custom Menu with Test Functions
   ========================= */

// This runs automatically when the spreadsheet opens
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🧪 CupsUp Tests')
    .addItem('1️⃣ Test Settings Load', 'test_settings')
    .addItem('2️⃣ Test Employee Load', 'test_employees')
    .addItem('3️⃣ Test Calendar Access', 'test_calendar')
    .addItem('4️⃣ Test Twilio Credentials', 'test_twilio_creds')
    .addSeparator()
    .addItem('5️⃣ Test Fetch This Week', 'test_fetch_week')
    .addItem('6️⃣ Test Group Chat Numbers', 'test_group_numbers')
    .addSeparator()
    .addItem('🚀 RUN ALL TESTS', 'runAutomatedTests')
    .addSeparator()
    .addItem('📱 Send TEST Message (YOUR # ONLY)', 'test_send_to_me')
    .addToUi();
}

/* ---------- Individual Test Functions ---------- */

function test_settings() {
  try {
    const settings = getSettings();
    const ui = SpreadsheetApp.getUi();

    let report = '✅ SETTINGS LOADED SUCCESSFULLY\n\n';
    report += `Calendar: ${settings.CALENDAR_ID}\n`;
    report += `Timezone: ${settings.TIMEZONE}\n`;
    report += `Twilio From: ${settings.TWILIO_FROM}\n`;
    report += `Group Chat: ${settings.GROUP_CHAT_NUMBERS ? settings.GROUP_CHAT_NUMBERS.substring(0, 50) + '...' : 'NOT SET'}\n\n`;

    // Check for missing settings
    const required = ['CALENDAR_ID', 'TIMEZONE', 'TWILIO_FROM', 'GROUP_CHAT_NUMBERS'];
    const missing = required.filter(k => !settings[k]);

    if (missing.length > 0) {
      report += `⚠️  Missing: ${missing.join(', ')}`;
      ui.alert('Settings Test', report, ui.ButtonSet.OK);
    } else {
      report += '✅ All required settings present!';
      ui.alert('✅ Settings Test Passed', report, ui.ButtonSet.OK);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Settings Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_employees() {
  try {
    const employees = listEmployees();
    const ui = SpreadsheetApp.getUi();

    if (employees.length === 0) {
      ui.alert('❌ Employee Test Failed', 'No employees found in Employees sheet', ui.ButtonSet.OK);
      return;
    }

    let report = `✅ LOADED ${employees.length} EMPLOYEES\n\n`;

    employees.forEach(emp => {
      const phoneValid = emp.Phone.match(/^\+1\d{10}$/);
      const icon = phoneValid ? '✅' : '❌';
      report += `${icon} ${emp.Name}: ${emp.Phone}\n`;
    });

    const invalidCount = employees.filter(e => !e.Phone.match(/^\+1\d{10}$/)).length;

    if (invalidCount > 0) {
      report += `\n⚠️  ${invalidCount} invalid phone number(s)`;
    } else {
      report += '\n✅ All phone numbers valid!';
    }

    ui.alert('Employee Test', report, ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Employee Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_calendar() {
  try {
    const settings = getSettings();
    const cal = CalendarApp.getCalendarById(settings.CALENDAR_ID);
    const ui = SpreadsheetApp.getUi();

    if (!cal) {
      ui.alert('❌ Calendar Test Failed',
        `Cannot access calendar: ${settings.CALENDAR_ID}\n\nCheck permissions!`,
        ui.ButtonSet.OK);
      return;
    }

    const name = cal.getName();
    const timezone = cal.getTimeZone();

    let report = '✅ CALENDAR ACCESS SUCCESSFUL\n\n';
    report += `Calendar Name: ${name}\n`;
    report += `Calendar ID: ${settings.CALENDAR_ID}\n`;
    report += `Timezone: ${timezone}\n`;

    ui.alert('✅ Calendar Test Passed', report, ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Calendar Test Failed',
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
      report += '❌ TWILIO_SID not found in Script Properties\n';
    } else if (settings.TWILIO_SID.length < 30) {
      report += '⚠️  TWILIO_SID seems too short\n';
      report += `   Length: ${settings.TWILIO_SID.length} characters\n`;
    } else {
      report += '✅ TWILIO_SID found\n';
      report += `   Format: ${settings.TWILIO_SID.substring(0, 10)}...\n`;
    }

    if (!settings.TWILIO_AUTH) {
      report += '❌ TWILIO_AUTH not found in Script Properties\n';
    } else if (settings.TWILIO_AUTH.length < 30) {
      report += '⚠️  TWILIO_AUTH seems too short\n';
      report += `   Length: ${settings.TWILIO_AUTH.length} characters\n`;
    } else {
      report += '✅ TWILIO_AUTH found\n';
      report += `   Format: ${settings.TWILIO_AUTH.substring(0, 10)}...\n`;
    }

    if (!settings.TWILIO_FROM) {
      report += '❌ TWILIO_FROM not in Settings sheet\n';
    } else if (!settings.TWILIO_FROM.match(/^\+1\d{10}$/)) {
      report += '⚠️  TWILIO_FROM format invalid\n';
      report += `   Value: ${settings.TWILIO_FROM}\n`;
      report += '   Should be: +1XXXXXXXXXX\n';
    } else {
      report += '✅ TWILIO_FROM configured\n';
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
      report += '✅ Twilio is fully configured!\n\nReady to send messages.';
      ui.alert('✅ Twilio Test Passed', report, ui.ButtonSet.OK);
    } else {
      report += '⚠️  Twilio not fully configured\n\nFix the issues above before sending messages.';
      ui.alert('⚠️  Twilio Configuration Incomplete', report, ui.ButtonSet.OK);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Twilio Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
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

    let report = `✅ FETCHED EVENTS FOR WEEK OF ${weekStart}\n\n`;
    report += `Found ${events.length} event(s)\n\n`;

    if (events.length === 0) {
      report += '⚠️  No events found this week\n';
      report += 'Add events to calendar to test further';
    } else {
      events.slice(0, 5).forEach(ev => {
        report += `📅 ${ev.date} ${ev.start}-${ev.end}\n`;
        report += `   ${ev.title}\n`;
        if (ev.city || ev.state) {
          report += `   📍 ${ev.city}, ${ev.state}\n`;
        }
        report += '\n';
      });

      if (events.length > 5) {
        report += `... and ${events.length - 5} more event(s)`;
      }
    }

    ui.alert('✅ Fetch Week Test Passed', report, ui.ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Fetch Week Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_group_numbers() {
  try {
    const settings = getSettings();
    const ui = SpreadsheetApp.getUi();

    if (!settings.GROUP_CHAT_NUMBERS) {
      ui.alert('❌ Group Numbers Test Failed',
        'GROUP_CHAT_NUMBERS not set in Settings sheet',
        ui.ButtonSet.OK);
      return;
    }

    const numbers = settings.GROUP_CHAT_NUMBERS.split(',').map(n => n.trim().replace(/^'+/, '')).filter(Boolean);

    let report = `✅ PARSED ${numbers.length} PHONE NUMBERS\n\n`;

    numbers.forEach((num, idx) => {
      const valid = num.match(/^\+1\d{10}$/);
      const icon = valid ? '✅' : '❌';
      report += `${icon} ${idx + 1}. ${num}\n`;
    });

    const invalidCount = numbers.filter(n => !n.match(/^\+1\d{10}$/)).length;

    report += '\n';

    if (invalidCount > 0) {
      report += `⚠️  ${invalidCount} invalid number(s)\n`;
      report += 'Fix format to: +1XXXXXXXXXX';
      ui.alert('⚠️  Group Numbers Have Issues', report, ui.ButtonSet.OK);
    } else {
      report += `✅ All ${numbers.length} numbers are valid!`;
      ui.alert('✅ Group Numbers Test Passed', report, ui.ButtonSet.OK);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Group Numbers Test Failed', e.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function test_send_to_me() {
  const ui = SpreadsheetApp.getUi();

  // Warning dialog
  const response = ui.alert(
    '⚠️  SEND TEST MESSAGE',
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
      ui.alert('❌ Cannot Send', 'Twilio credentials not configured', ui.ButtonSet.OK);
      return;
    }

    if (numbers.length > 1) {
      ui.alert('⚠️  WARNING',
        `You have ${numbers.length} numbers in GROUP_CHAT_NUMBERS.\n\n` +
        'This will send to ALL of them.\n\n' +
        'For testing, set GROUP_CHAT_NUMBERS to ONLY YOUR number first!',
        ui.ButtonSet.OK);
      return;
    }

    const testMessage = `🧪 CupsUp Scheduler Test\n\n` +
                       `Sent: ${new Date().toLocaleString()}\n` +
                       `From: ${from}\n\n` +
                       `✅ Your system is working!\n\n` +
                       `Reply STOP to unsubscribe`;

    twilioSend(sid, auth, from, numbers[0], testMessage);

    ui.alert('✅ Test Message Sent!',
      `Message sent to: ${numbers[0]}\n\n` +
      'Check your phone within 60 seconds.\n\n' +
      'If you receive it, Twilio is working!',
      ui.ButtonSet.OK);

  } catch (e) {
    ui.alert('❌ Send Test Failed',
      `Error: ${e.message}\n\n` +
      'Check Twilio credentials and account balance.',
      ui.ButtonSet.OK);
  }
}
