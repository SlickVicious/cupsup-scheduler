/* =========================
   CupsUp Scheduler - Enhanced Version
   MANUAL ASSIGNMENT ONLY
   ========================= */

const DB_SHEET = {
  SETTINGS: 'Settings',
  EMPLOYEES: 'Employees',
  ASSIGN: 'Assignments',
  VENUES: 'Venues',
};

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('ui');
  return template.evaluate()
    .setTitle('CupsUp Scheduler')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
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

    return events
      .filter(ev => {
        const title = ev.getTitle().toLowerCase();
        // Filter out non-events (notes about availability, etc.)
        const excludePatterns = ['needs off', 'unavailable', 'out of office', 'pto', 'vacation'];
        return !excludePatterns.some(pattern => title.includes(pattern));
      })
      .map(ev => {
        let loc = (ev.getLocation() || '').trim();
        let { city, state, fullAddress } = parseCityState(loc);
        let venueSource = loc ? 'calendar' : null;

        // Auto-save new venues with locations from calendar
        if (loc) {
          const existingVenue = lookupVenue(ev.getTitle());
          if (!existingVenue) {
            // New venue with location - save it automatically
            try {
              saveVenue(ev.getTitle(), loc, city, state, 'Auto-saved from calendar');
            } catch (e) {
              // Silently fail if venue save errors - don't break event fetching
              Logger.log(`Failed to auto-save venue "${ev.getTitle()}": ${e.message}`);
            }
          }
        }

        // If no location in calendar, try venue lookup
        if (!loc) {
          const venue = lookupVenue(ev.getTitle());
          if (venue && venue.address) {
            loc = venue.address;
            fullAddress = venue.address;
            city = venue.city;
            state = venue.state;
            venueSource = 'database';
          }
        }

        // Generate map link if location exists
        const mapLink = loc ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}` : '';

        // Check if it's a multi-day event
        const startDate = new Date(ev.getStartTime());
        const endDate = new Date(ev.getEndTime());
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
        const isMultiDay = daysDiff > 0;

        return {
          id: ev.getId(),
          title: ev.getTitle(),
          date: isoDate(ev.getStartTime()),
          endDate: isMultiDay ? isoDate(ev.getEndTime()) : null,
          start: isoTime(ev.getStartTime()),
          end: isoTime(ev.getEndTime()),
          isMultiDay: isMultiDay,
          dayCount: daysDiff + 1,
          city,
          state,
          locationRaw: loc,
          fullAddress,
          mapLink,
          venueSource  // 'calendar', 'database', or null
        };
      })
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  } catch (e) {
    throw new Error(`Calendar error: ${e.message}. Check that calendar is shared with edit permissions.`);
  }
}

function parseCityState(location) {
  if (!location) return { city: '', state: '', fullAddress: '' };

  const parts = location.split(',').map(s => s.trim()).filter(Boolean);

  // Handle full addresses like "123 Street, City, ST 12345, Country"
  // Look for state abbreviation (2 uppercase letters) followed by zip
  let city = '';
  let state = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Check if this part contains state abbreviation and zip (e.g., "VA 23454")
    const stateZipMatch = part.match(/\b([A-Z]{2})\s+\d{5}/);
    if (stateZipMatch) {
      state = stateZipMatch[1];
      // City is typically the part before this
      if (i > 0) {
        city = parts[i - 1];
      }
      break;
    }
  }

  // Fallback to simple parsing if no state/zip pattern found
  if (!city && parts.length >= 2) {
    // Filter out "USA", "US", etc.
    const filteredParts = parts.filter(p => !p.match(/^(USA?|United States)$/i));
    if (filteredParts.length >= 2) {
      const lastPart = filteredParts[filteredParts.length - 1];
      state = lastPart.split(' ')[0].toUpperCase().slice(0, 2);
      city = filteredParts[filteredParts.length - 2];
    }
  }

  // If still no data, use first part as venue name
  if (!city && parts.length > 0) {
    city = parts[0];
  }

  return { city, state, fullAddress: location };
}

/* ---------- Venues ---------- */
function getVenues() {
  const sh = getSheet(DB_SHEET.VENUES);
  if (!sh) {
    // Create Venues sheet if it doesn't exist
    const ss = getSpreadsheet();
    const newSheet = ss.insertSheet(DB_SHEET.VENUES);
    newSheet.getRange(1, 1, 1, 5).setValues([[
      'Venue Name', 'Full Address', 'City', 'State', 'Notes'
    ]]);
    return [];
  }

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  const rows = sh.getRange(2, 1, lastRow - 1, 5).getValues();
  return rows.filter(r => r[0]).map(([name, address, city, state, notes]) => ({
    name: String(name).trim(),
    address: String(address || '').trim(),
    city: String(city || '').trim(),
    state: String(state || '').trim(),
    notes: String(notes || '').trim()
  }));
}

function lookupVenue(eventTitle) {
  const venues = getVenues();
  const titleLower = eventTitle.toLowerCase().trim();

  // Try exact match first
  let match = venues.find(v => v.name.toLowerCase() === titleLower);

  // Try partial match (venue name contained in event title)
  if (!match) {
    match = venues.find(v => {
      const venueLower = v.name.toLowerCase();
      return titleLower.includes(venueLower) || venueLower.includes(titleLower);
    });
  }

  return match || null;
}

function saveVenue(venueName, fullAddress, city, state, notes = '') {
  const sh = getSheet(DB_SHEET.VENUES);
  if (!sh) {
    throw new Error('Venues sheet not found');
  }

  // Check if venue already exists
  const venues = getVenues();
  const existingIdx = venues.findIndex(v =>
    v.name.toLowerCase() === venueName.toLowerCase()
  );

  if (existingIdx >= 0) {
    // Update existing venue
    const rowIdx = existingIdx + 2; // +2 for header and 0-index
    sh.getRange(rowIdx, 1, 1, 5).setValues([[
      venueName, fullAddress, city, state, notes
    ]]);
  } else {
    // Add new venue
    const newRow = sh.getLastRow() + 1;
    sh.getRange(newRow, 1, 1, 5).setValues([[
      venueName, fullAddress, city, state, notes
    ]]);
  }

  return { success: true };
}

/* ---------- Employees ---------- */
/**
 * Validates and cleans a phone number
 * @param {string} phone - Phone number to validate
 * @param {string} employeeName - Employee name for error messages
 * @returns {string} - Cleaned phone number in +1XXXXXXXXXX format
 * @throws {Error} - If phone number is invalid
 */
function validateEmployeePhone(phone, employeeName) {
  // Clean phone number
  const cleaned = String(phone || '').trim().replace(/^'+/, '').replace(/\s+/g, '').replace(/[^\d+]/g, '');

  // Check if empty
  if (!cleaned) {
    throw new Error(
      `Missing phone number for ${employeeName}.\n` +
      `Please add a phone number in +1XXXXXXXXXX format.`
    );
  }

  // Check format
  if (!cleaned.match(/^\+1\d{10}$/)) {
    throw new Error(
      `Invalid phone format for ${employeeName}: "${phone}"\n\n` +
      `Expected format: +1XXXXXXXXXX (e.g., +15551234567)\n` +
      `Your format: ${cleaned}\n\n` +
      `Common fixes:\n` +
      `- Add "+1" prefix if missing\n` +
      `- Remove spaces, dashes, parentheses\n` +
      `- Must be exactly 11 characters (+1 + 10 digits)`
    );
  }

  // Check for known invalid/test numbers
  const invalidPrefixes = ['5555555', '5550000', '5551234']; // Common test numbers
  const digits = cleaned.slice(2); // Remove +1

  if (invalidPrefixes.some(prefix => digits.startsWith(prefix))) {
    Logger.log(`Warning: ${employeeName} has test/invalid number: ${cleaned}`);
  }

  return cleaned;
}

/**
 * Checks for duplicate phone numbers across employees
 * @param {Array} employees - List of employee objects
 * @returns {Array} - Array of duplicate issues (empty if none)
 */
function checkDuplicatePhones(employees) {
  const phoneCounts = {};
  const duplicates = [];

  employees.forEach(emp => {
    if (phoneCounts[emp.Phone]) {
      phoneCounts[emp.Phone].push(emp.Name);
    } else {
      phoneCounts[emp.Phone] = [emp.Name];
    }
  });

  Object.keys(phoneCounts).forEach(phone => {
    if (phoneCounts[phone].length > 1) {
      duplicates.push({
        phone: phone,
        employees: phoneCounts[phone]
      });
    }
  });

  return duplicates;
}

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
  const employees = [];
  const validationErrors = [];

  // Validate each employee
  rows.filter(r => r[0]).forEach(([Name, Phone, Role, Notes], idx) => {
    const employeeName = String(Name).trim();

    try {
      const validPhone = validateEmployeePhone(Phone, employeeName);
      employees.push({
        Name: employeeName,
        Phone: validPhone,
        Role: String(Role || '').trim(),
        Notes: String(Notes || '').trim()
      });
    } catch (e) {
      validationErrors.push(`Row ${idx + 2}: ${e.message}`);
    }
  });

  // If there are validation errors, throw with all details
  if (validationErrors.length > 0) {
    throw new Error(
      `Phone validation failed for ${validationErrors.length} employee(s):\n\n` +
      validationErrors.join('\n\n') +
      `\n\nPlease fix these issues in the Employees sheet before continuing.`
    );
  }

  // Check for duplicate phone numbers
  const duplicates = checkDuplicatePhones(employees);
  if (duplicates.length > 0) {
    const dupeMessages = duplicates.map(d =>
      `${d.phone}: ${d.employees.join(', ')}`
    ).join('\n');

    throw new Error(
      `Duplicate phone numbers detected:\n\n${dupeMessages}\n\n` +
      `Each employee must have a unique phone number.`
    );
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

/**
 * Comprehensive validation for assignment data
 * @param {string} weekStartIso - Week start date in ISO format
 * @param {string} eventId - Event ID
 * @param {Object} eventData - Event metadata
 * @param {Array} assignments - Array of staff assignments
 * @throws {Error} - If validation fails
 */
function validateAssignmentData(weekStartIso, eventId, eventData, assignments) {
  // Load employee list for validation
  const validEmployees = listEmployees().map(e => e.Name);

  // Validate each assignment
  if (assignments && assignments.length > 0) {
    // 1. Check maximum assignments per event
    if (assignments.length > 20) {
      throw new Error(
        `Too many staff assignments (${assignments.length}).\n` +
        `Maximum 20 staff per event. Please reduce assignments.`
      );
    }

    const employeeTimeSlots = {}; // Track assignments per employee for overlap detection

    assignments.forEach((a, idx) => {
      const prefix = `Assignment ${idx + 1}`;

      // 2. Check required fields
      if (!a.name) {
        throw new Error(`${prefix}: Employee name is required`);
      }
      if (!a.start || !a.end) {
        throw new Error(`${prefix}: Start and end times are required`);
      }

      // 3. Employee exists check
      if (!validEmployees.includes(a.name)) {
        throw new Error(
          `${prefix}: Employee "${a.name}" not found in Employees sheet.\n\n` +
          `Valid employees:\n${validEmployees.slice(0, 10).join('\n')}` +
          (validEmployees.length > 10 ? `\n... and ${validEmployees.length - 10} more` : '')
        );
      }

      // 4. String length limits
      if (a.name.length > 50) {
        throw new Error(
          `${prefix}: Employee name too long (${a.name.length} chars).\n` +
          `Maximum 50 characters.`
        );
      }

      // 5. Time format validation
      if (!a.start.match(/^\d{2}:\d{2}$/) || !a.end.match(/^\d{2}:\d{2}$/)) {
        throw new Error(
          `${prefix}: Invalid time format.\n` +
          `Expected: HH:MM (e.g., 09:00, 17:30)\n` +
          `Got: ${a.start} - ${a.end}`
        );
      }

      // 6. Time logic validation
      if (a.start >= a.end) {
        throw new Error(
          `${prefix}: Start time (${a.start}) must be before end time (${a.end})`
        );
      }

      // 7. Event time boundary validation (with 1-hour buffer for setup/cleanup)
      const eventStart = eventData.start || '00:00';
      const eventEnd = eventData.end || '23:59';
      const bufferMinutes = 60; // 1 hour buffer

      // Parse times to minutes for easier comparison
      const parseTime = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const assignStart = parseTime(a.start);
      const assignEnd = parseTime(a.end);
      const evStart = parseTime(eventStart);
      const evEnd = parseTime(eventEnd);

      if (assignStart < evStart - bufferMinutes || assignEnd > evEnd + bufferMinutes) {
        Logger.log(
          `Warning ${prefix}: Assignment time (${a.start}-${a.end}) ` +
          `is outside event hours (${eventStart}-${eventEnd}). ` +
          `This may be intentional for setup/cleanup.`
        );
      }

      // 8. Duplicate/overlap detection within same event
      if (!employeeTimeSlots[a.name]) {
        employeeTimeSlots[a.name] = [];
      }

      // Check for overlaps with existing assignments for this employee
      employeeTimeSlots[a.name].forEach(existingSlot => {
        const existingStart = parseTime(existingSlot.start);
        const existingEnd = parseTime(existingSlot.end);

        // Check if times overlap
        if (!(assignEnd <= existingStart || assignStart >= existingEnd)) {
          throw new Error(
            `${prefix}: ${a.name} is already assigned overlapping time in this event.\n\n` +
            `New assignment: ${a.start}-${a.end}\n` +
            `Existing assignment: ${existingSlot.start}-${existingSlot.end}\n\n` +
            `Please adjust times or remove one assignment.`
          );
        }
      });

      employeeTimeSlots[a.name].push({ start: a.start, end: a.end });
    });
  }

  // 9. Event data validation
  if (!eventData.title) {
    throw new Error('Event title is required');
  }

  if (eventData.title.length > 100) {
    throw new Error(
      `Event title too long (${eventData.title.length} chars).\n` +
      `Maximum 100 characters.`
    );
  }

  if (!eventData.date || !eventData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    throw new Error(
      `Invalid event date format.\n` +
      `Expected: YYYY-MM-DD\n` +
      `Got: ${eventData.date}`
    );
  }

  // 10. Notes length validation
  if (eventData.notes && eventData.notes.length > 500) {
    throw new Error(
      `Event notes too long (${eventData.notes.length} chars).\n` +
      `Maximum 500 characters.`
    );
  }
}

function saveAssignment(weekStartIso, eventId, eventData, assignments) {
  const sh = getSheet(DB_SHEET.ASSIGN);
  if (!sh) {
    throw new Error('Assignments sheet not found.');
  }

  // Run comprehensive validation
  validateAssignmentData(weekStartIso, eventId, eventData, assignments);

  const last = sh.getLastRow();

  // Remove old assignment for this event
  if (last >= 2) {
    const all = sh.getRange(2, 1, last - 1, 12).getValues();
    const keep = all.filter(r => {
      // Convert Date objects to strings for comparison
      const rowWeekStart = r[0] instanceof Date
        ? Utilities.formatDate(r[0], getSettings().TIMEZONE, 'yyyy-MM-dd')
        : String(r[0]);
      return !(rowWeekStart === weekStartIso && r[1] === eventId);
    });
    sh.getRange(2, 1, last - 1, 12).clearContent();
    if (keep.length) sh.getRange(2, 1, keep.length, 12).setValues(keep);
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
      '', // SMSStatus - will be updated when group chat sent
      eventData.fullAddress || eventData.locationRaw || '', // Add full address
      eventData.notes || '' // Event notes
    ];
    sh.getRange(sh.getLastRow() + 1, 1, 1, 12).setValues([row]);
  }

  return {success: true};
}

/* ---------- Schedule Message Generation ---------- */
function getScheduleMessage(weekStartIso) {

  // Get all assignments for the week
  const sh = getSheet(DB_SHEET.ASSIGN);
  const last = sh.getLastRow();
  if (last < 2) {
    throw new Error('No assignments found for this week. Please assign staff to events before sending group chat.');
  }

  // Convert Date objects to ISO strings for comparison
  const rows = sh.getRange(2, 1, last - 1, 12).getValues()
    .filter(r => {
      const weekStartValue = r[0];
      // Handle both Date objects and strings
      const weekStartStr = weekStartValue instanceof Date
        ? Utilities.formatDate(weekStartValue, getSettings().TIMEZONE, 'yyyy-MM-dd')
        : String(weekStartValue);
      return weekStartStr === weekStartIso;
    });

  if (rows.length === 0) {
    throw new Error('No assignments found for this week. Please assign staff to events before sending group chat.');
  }

  // Helper to convert 24-hour time to 12-hour format
  const format12Hour = (time24) => {
    if (!time24 || !time24.match(/^\d{2}:\d{2}$/)) return time24;
    const [hours, minutes] = time24.split(':').map(Number);
    if (hours === 0) return `12:${minutes.toString().padStart(2, '0')}am`;
    if (hours < 12) return `${hours}:${minutes.toString().padStart(2, '0')}am`;
    if (hours === 12) return `12:${minutes.toString().padStart(2, '0')}pm`;
    return `${hours - 12}:${minutes.toString().padStart(2, '0')}pm`;
  };

  // Build schedule message with date range
  const weekStart = new Date(weekStartIso + 'T00:00:00');
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Format date range for title
  const formatDateShort = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  // Show compact date range (e.g., "Nov 5-10" if same month, "Oct 30-Nov 5" if different months)
  const startStr = formatDateShort(weekStart);
  const endDay = weekEnd.getDate();
  const dateRange = weekStart.getMonth() === weekEnd.getMonth()
    ? `${startStr}-${endDay}`
    : `${startStr}-${formatDateShort(weekEnd)}`;

  let message = `CUPSUP SCHEDULE: ${dateRange}\n\n`;

  // Group by date
  const byDate = {};
  rows.forEach(row => {
    const [weekStart, eventId, title, dateValue, startValue, endValue, city, state, assignedData, smsStatus, fullAddress, notes] = row;
    // Convert Date object to ISO string for consistent grouping
    const dateISO = dateValue instanceof Date
      ? Utilities.formatDate(dateValue, getSettings().TIMEZONE, 'yyyy-MM-dd')
      : String(dateValue);
    // Convert time values to HH:MM format if they're Date objects
    const start = startValue instanceof Date
      ? Utilities.formatDate(startValue, getSettings().TIMEZONE, 'HH:mm')
      : String(startValue);
    const end = endValue instanceof Date
      ? Utilities.formatDate(endValue, getSettings().TIMEZONE, 'HH:mm')
      : String(endValue);
    if (!byDate[dateISO]) byDate[dateISO] = [];
    byDate[dateISO].push({title, start, end, city, state, assigned: assignedData, fullAddress: fullAddress || '', locationRaw: fullAddress || '', notes: notes || ''});
  });

  // Format message
  const dates = Object.keys(byDate).sort();
  dates.forEach(dateISO => {
    const d = new Date(dateISO + 'T00:00:00');
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    // Group events for same day
    const dayEvents = byDate[dateISO];

    message += `${days[d.getDay()]}\n`;

    // Show each event
    dayEvents.forEach(event => {
      // For multi-day events, don't show event times (they're usually 00:00-00:00)
      // Instead, show individual staff times
      const isAllDay = event.start === '00:00' && event.end === '00:00';

      if (isAllDay) {
        // Just show title for multi-day/all-day events
        message += `${event.title}\n`;
      } else {
        // Show title with time range for single-day events
        const startTime = format12Hour(event.start);
        const endTime = format12Hour(event.end);
        message += `${event.title} ${startTime}-${endTime}\n`;
      }

      // Build location text - prefer city/state for cleaner display
      let locationText = '';
      if (event.city || event.state) {
        locationText = [event.city, event.state].filter(Boolean).join(', ');
      } else if (event.fullAddress) {
        locationText = event.fullAddress;
      } else if (event.locationRaw) {
        locationText = event.locationRaw;
      }

      // Add location with pin emoji on separate line
      if (locationText) {
        message += `📍 ${locationText}\n`;
        // Add clickable Google Maps URL
        const mapUrl = `https://maps.google.com/?q=${encodeURIComponent(locationText)}`;
        message += `${mapUrl}\n`;
      }

      // Add notes if they exist
      if (event.notes && event.notes.trim()) {
        message += `📝 ${event.notes.trim()}\n`;
      }

      // List staff members (times are same as event, no need to repeat)
      if (event.assigned) {
        // Parse staff names: "Name:HH:MM-HH:MM"
        const staffNames = event.assigned.split(',').map(s => {
          const match = s.trim().match(/^(.+):(\d{2}:\d{2})-(\d{2}:\d{2})$/);
          if (match) {
            return match[1]; // Just the name
          }
          return s.trim();
        });
        staffNames.forEach(name => {
          message += `${name}\n`;
        });
      }

      message += `\n`;
    });
  });

  return {
    success: true,
    message: message,
    eventCount: dates.length,
    characterCount: message.length
  };
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

function api_getScheduleMessage(weekStartIso) {
  try {
    return getScheduleMessage(weekStartIso);
  } catch (e) {
    throw new Error(`Failed to generate schedule: ${e.message}`);
  }
}

function api_saveVenue(venueName, fullAddress, city, state, notes) {
  try {
    return saveVenue(venueName, fullAddress, city, state, notes);
  } catch (e) {
    throw new Error(`Failed to save venue: ${e.message}`);
  }
}

/* ---------- VENUE MAINTENANCE ---------- */
function removeDuplicateVenues() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Remove Duplicate Venues',
    'This will remove duplicate venue entries from the Venues sheet.\n\n' +
    'Duplicates are identified by matching venue names (case-insensitive).\n' +
    'The first occurrence will be kept.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const sh = getSheet(DB_SHEET.VENUES);
    if (!sh) {
      throw new Error('Venues sheet not found');
    }

    const lastRow = sh.getLastRow();
    if (lastRow < 2) {
      ui.alert('No venues found', 'The Venues sheet is empty.', ui.ButtonSet.OK);
      return;
    }

    const data = sh.getRange(2, 1, lastRow - 1, 5).getValues();
    const seen = new Set();
    const rowsToDelete = [];

    // Identify duplicates (case-insensitive venue name comparison)
    data.forEach((row, idx) => {
      const venueName = String(row[0]).trim().toLowerCase();

      if (!venueName) {
        // Empty row
        rowsToDelete.push(idx + 2); // +2 for header and 0-index
        return;
      }

      if (seen.has(venueName)) {
        // Duplicate found
        rowsToDelete.push(idx + 2); // +2 for header and 0-index
      } else {
        seen.add(venueName);
      }
    });

    if (rowsToDelete.length === 0) {
      ui.alert('✅ No Duplicates Found', 'All venues are unique!', ui.ButtonSet.OK);
      return;
    }

    // Delete rows in reverse order to maintain row indices
    rowsToDelete.reverse().forEach(rowNum => {
      sh.deleteRow(rowNum);
    });

    ui.alert(
      '✅ Duplicates Removed!',
      `Removed ${rowsToDelete.length} duplicate/empty rows.\n\n` +
      `Kept ${seen.size} unique venues.`,
      ui.ButtonSet.OK
    );

  } catch (e) {
    ui.alert('❌ Remove Failed', e.message, ui.ButtonSet.OK);
  }
}

/* ---------- ONE-TIME VENUE IMPORT ---------- */
function bulkImportHistoricalVenues() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Bulk Import Historical Venues',
    'This will scan your calendar (last 6 months + next 6 months)\n' +
    'and import all event locations to the Venues sheet.\n\n' +
    'Run this ONCE to catch up historical data.\n' +
    'After this, new venues are auto-saved when you fetch events.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const { CALENDAR_ID } = getSettings();
    if (!CALENDAR_ID) {
      throw new Error('CALENDAR_ID not set in Settings sheet');
    }

    const cal = CalendarApp.getCalendarById(CALENDAR_ID);
    if (!cal) {
      throw new Error('Cannot access calendar: ' + CALENDAR_ID);
    }

    // Get events from the last 6 months and next 6 months
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    const sixMonthsAhead = new Date(today);
    sixMonthsAhead.setMonth(today.getMonth() + 6);

    const events = cal.getEvents(sixMonthsAgo, sixMonthsAhead);

    let imported = 0;
    let skipped = 0;

    events.forEach(ev => {
      const title = ev.getTitle();
      const loc = (ev.getLocation() || '').trim();

      // Skip events without locations
      if (!loc) {
        skipped++;
        return;
      }

      // Skip non-events
      const titleLower = title.toLowerCase();
      const excludePatterns = ['needs off', 'unavailable', 'out of office', 'pto', 'vacation'];
      if (excludePatterns.some(pattern => titleLower.includes(pattern))) {
        skipped++;
        return;
      }

      // Check if venue already exists
      const existingVenue = lookupVenue(title);
      if (existingVenue) {
        skipped++;
        return;
      }

      // Parse location and save
      const { city, state } = parseCityState(loc);
      try {
        saveVenue(title, loc, city, state, 'Bulk imported from calendar history');
        imported++;
      } catch (e) {
        Logger.log(`Failed to import venue "${title}": ${e.message}`);
      }
    });

    ui.alert(
      '✅ Bulk Import Complete!',
      `Imported: ${imported} new venues\n` +
      `Skipped: ${skipped} (already exist or no location)\n\n` +
      `Check the Venues sheet to see all imported locations.\n\n` +
      `From now on, new venues will be auto-saved when you fetch events.`,
      ui.ButtonSet.OK
    );

  } catch (e) {
    ui.alert('❌ Import Failed', e.message, ui.ButtonSet.OK);
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
    const required = ['CALENDAR_ID', 'TIMEZONE', 'GROUP_CHAT_NUMBERS'];
    const missing = required.filter(k => !settings[k]);

    if (missing.length > 0) {
      addTest('Settings Config', 'FAIL', `Missing: ${missing.join(', ')}`);
    } else {
      addTest('Settings Config', 'PASS', 'All settings configured');
    }
  } catch (e) {
    addTest('Settings Config', 'FAIL', e.message);
  }

  // Test 3: Calendar Access
  try {
    const settings = getSettings();
    const cal = CalendarApp.getCalendarById(settings.CALENDAR_ID);
    if (!cal) throw new Error('Cannot access calendar');

    const name = cal.getName();
    addTest('Calendar Access', 'PASS', `Connected to: ${name}`);
  } catch (e) {
    addTest('Calendar Access', 'FAIL', e.message, 'Check calendar permissions');
  }

  // Test 4: Employee Data Validation
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

  // Test 5: Fetch Events Test
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

  // Test 6: Group Chat Numbers
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

  // Show results in UI dialog
  try {
    const ui = SpreadsheetApp.getUi();
    if (results.failed === 0) {
      ui.alert('✅ All Tests Passed!', report, ui.ButtonSet.OK);
    } else {
      ui.alert('⚠️ Some Tests Failed', report, ui.ButtonSet.OK);
    }
  } catch (e) {
    // If UI not available, just log
    Logger.log('Could not display UI: ' + e.message);
  }

  return {results, report};
}

/* ---------- UTILITY: Fix Phone Numbers ---------- */
function fixEmployeePhoneNumbers() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ Fix Employee Phone Numbers',
    'This will add +1 prefix to all employee phone numbers.\n\n' +
    'Example: 17578167781 → +17578167781\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  try {
    const sh = getSheet(DB_SHEET.EMPLOYEES);
    if (!sh) throw new Error('Employees sheet not found');

    const lastRow = sh.getLastRow();
    if (lastRow < 2) throw new Error('No employees found');

    let fixed = 0;
    const rows = sh.getRange(2, 1, lastRow - 1, 4).getValues();

    rows.forEach((row, idx) => {
      const phone = String(row[1]).trim().replace(/^'+/, '').replace(/\s+/g, '');

      // If phone doesn't start with +1 but is 11 digits starting with 1, add +
      if (phone.match(/^1\d{10}$/) && !phone.startsWith('+')) {
        const newPhone = '+' + phone;
        sh.getRange(idx + 2, 2).setValue(newPhone);
        fixed++;
      }
    });

    ui.alert('✅ Phone Numbers Fixed!',
      `Updated ${fixed} phone number(s).\n\n` +
      'All employee phone numbers now in +1XXXXXXXXXX format.',
      ui.ButtonSet.OK);

  } catch (e) {
    ui.alert('❌ Fix Failed', e.message, ui.ButtonSet.OK);
  }
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
    .addSeparator()
    .addItem('4️⃣ Test Fetch This Week', 'test_fetch_week')
    .addItem('5️⃣ Debug Assignments (DATE MISMATCH)', 'test_assignments_debug')
    .addSeparator()
    .addItem('🚀 RUN ALL TESTS', 'runAutomatedTests')
    .addSeparator()
    .addItem('🔧 Fix Employee Phone Numbers', 'fixEmployeePhoneNumbers')
    .addItem('📍 Bulk Import Historical Venues (RUN ONCE)', 'bulkImportHistoricalVenues')
    .addItem('🧹 Remove Duplicate Venues', 'removeDuplicateVenues')
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
    report += `Group Chat: ${settings.GROUP_CHAT_NUMBERS ? settings.GROUP_CHAT_NUMBERS.substring(0, 50) + '...' : 'NOT SET'}\n\n`;

    // Check for missing settings
    const required = ['CALENDAR_ID', 'TIMEZONE', 'GROUP_CHAT_NUMBERS'];
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


function test_assignments_debug() {
  const ui = SpreadsheetApp.getUi();

  try {
    const sh = getSheet(DB_SHEET.ASSIGN);
    const lastRow = sh.getLastRow();

    if (lastRow < 2) {
      ui.alert('📊 Assignment Debug',
        '❌ Assignments sheet is EMPTY!\n\n' +
        'You need to:\n' +
        '1. Open the web app\n' +
        '2. Select a week\n' +
        '3. Click "Fetch Week"\n' +
        '4. Assign staff to events\n' +
        '5. Click "Save" for each event',
        ui.ButtonSet.OK);
      return;
    }

    // Get all WeekStart dates (column 1) and convert to ISO strings
    const weekStartDates = sh.getRange(2, 1, lastRow - 1, 1).getValues()
      .map(r => {
        const val = r[0];
        if (!val) return null;
        return val instanceof Date
          ? Utilities.formatDate(val, getSettings().TIMEZONE, 'yyyy-MM-dd')
          : String(val);
      })
      .filter(Boolean);

    // Get unique dates
    const uniqueDates = [...new Set(weekStartDates)];

    // Get today's Monday (what UI would use)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() + daysToMonday);
    thisMonday.setHours(0, 0, 0, 0);
    const thisMondayIso = Utilities.formatDate(thisMonday, getSettings().TIMEZONE, 'yyyy-MM-dd');

    let report = '📊 ASSIGNMENT DATE DEBUG\n\n';
    report += `Total assignment rows: ${weekStartDates.length}\n`;
    report += `Unique weeks with data: ${uniqueDates.length}\n\n`;

    report += '📅 WEEKS IN YOUR ASSIGNMENTS SHEET:\n';
    uniqueDates.forEach(date => {
      const count = weekStartDates.filter(d => d === date).length;
      const isThisWeek = date === thisMondayIso ? ' ← THIS WEEK' : '';
      report += `  ${date} (${count} assignments)${isThisWeek}\n`;
    });

    report += `\n🎯 CURRENT WEEK START: ${thisMondayIso}\n`;

    const hasThisWeek = uniqueDates.includes(thisMondayIso);

    if (hasThisWeek) {
      report += '\n✅ THIS WEEK HAS ASSIGNMENTS!\n';
      report += 'Group chat should work for this week.';
    } else {
      report += '\n❌ THIS WEEK HAS NO ASSIGNMENTS!\n\n';
      report += 'To send group chat, you need to:\n';
      report += '1. Open the web app\n';
      report += `2. Select week starting ${thisMondayIso}\n`;
      report += '3. Fetch events and assign staff\n';
      report += '4. Save assignments\n';
      report += '5. Then try sending group chat';
    }

    ui.alert('📊 Assignment Debug Report', report, ui.ButtonSet.OK);

  } catch (e) {
    ui.alert('❌ Debug Failed', e.message, ui.ButtonSet.OK);
  }
}
