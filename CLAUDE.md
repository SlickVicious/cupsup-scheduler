# CLAUDE.md - AI Assistant Guide for CupsUp Scheduler

**Last Updated:** November 23, 2025
**Project Version:** 1.0.0
**Status:** ✅ Production Ready (Security Grade: A-)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Technology Stack & Architecture](#technology-stack--architecture)
4. [Development Workflow](#development-workflow)
5. [Naming Conventions & Patterns](#naming-conventions--patterns)
6. [Data Models](#data-models)
7. [Critical Implementation Details](#critical-implementation-details)
8. [Testing Strategy](#testing-strategy)
9. [Security Considerations](#security-considerations)
10. [Common Tasks Guide](#common-tasks-guide)
11. [Gotchas & Important Notes](#gotchas--important-notes)

---

## Project Overview

### What is CupsUp Scheduler?
CupsUp Scheduler is a Google Apps Script-based scheduling system for managing employee assignments and coordinating event schedules. It integrates with Google Calendar and Google Sheets to provide a web-based interface for assigning staff to events.

### Key Features
- **Calendar Integration**: Fetches events from Google Calendar with multi-day event support
- **Manual Assignment**: Assign employees to events with individual time slots per staff member
- **Venue Management**: Auto-save venue locations from calendar events with searchable database
- **Schedule Generation**: Generate formatted weekly schedules for distribution
- **Employee Management**: Track employee information with validated phone numbers (E.164 format)
- **Security Hardened**: XSS protection, XFrame protection, comprehensive input validation
- **Automated Testing**: Built-in test suite with 6 comprehensive tests
- **Dark Theme UI**: Mobile-responsive web interface ("Midnight Sauce" theme)

### Project Statistics
- **Total Lines of Code**: 2,179 lines
- **Main Application**: 1,474 lines (33 functions)
- **Documentation Files**: 16 markdown files
- **Functions**: 37 total (33 main + 4 diagnostics)
- **Automated Tests**: 6 comprehensive + 5 individual diagnostics
- **Security Grade**: A- (95/100 after Phase 2 hardening)

---

## Repository Structure

```
/home/user/cupsup-scheduler/
├── src/                                    # Source code (Google Apps Script)
│   ├── Code.gs                             # Main application (1,474 lines, 33 functions)
│   ├── DiagnosesEmployees.gs              # Diagnostic utilities (64 lines, 4 functions)
│   ├── ui.html                             # Web interface (641 lines, dark theme)
│   └── scheduler-dark-theme.html          # CSS theme definitions (400+ lines)
│
├── docs/                                   # Comprehensive documentation
│   ├── API_REFERENCE.md                    # Complete API documentation (765 lines)
│   ├── COMPREHENSIVE_AUDIT_REPORT.md       # Security audit (42 issues analyzed)
│   ├── TEST_REPORT.md                      # Testing procedures & results
│   ├── USER_GUIDE.md                       # End-user manual
│   ├── INSTRUCTIONS.md                     # Quick start guide
│   ├── IMAGE_ANNOTATION_GUIDE.md          # UI screenshots documentation
│   ├── *.png                               # UI screenshots (Calendar, Main UI, Staff Selection)
│   │
│   ├── deployment/                         # Deployment documentation
│   │   ├── DEPLOYMENT.md                   # Step-by-step deployment guide
│   │   ├── DEPLOYMENT_READY.md             # Production readiness checklist
│   │   ├── QUICK_DEPLOY.md                 # Quick start guide
│   │   ├── DEPLOY_TO_SHEETS.md             # Google Sheets setup instructions
│   │   └── ACCESS_GUIDE.md                 # Access & permission management
│   │
│   ├── security/                           # Security documentation
│   │   └── SECURITY_ANALYSIS.md            # Security review & recommendations (14KB)
│   │
│   └── development/                        # Developer documentation
│       ├── CLAUDE_CODE_CHEATSHEET.md       # Quick reference for daily use
│       ├── OptDevWorkflow.md               # Optimized development workflow
│       ├── claude-code-optimization.md     # 93% token reduction guide
│       └── claude-code-cupsup-workflow.md  # Project-specific workflows
│
├── scripts/                                # Helper scripts
│   ├── deploy-helper.sh                    # Interactive deployment menu
│   ├── complete-setup.sh                   # Setup automation
│   └── test-validation.js                  # Local validation tests (Node.js)
│
├── archived/                               # Legacy code
│   └── Cusp-Up-Scheduler-old-version.gs   # Previous version (reference only)
│
├── package.json                            # NPM metadata & clasp scripts
├── .clasp.json                             # Apps Script project ID (gitignored)
├── appsscript.json                         # Apps Script manifest (gitignored)
├── README.md                               # Main project documentation
├── LICENSE                                 # MIT License
├── .gitignore                              # Git ignore rules
└── cups-up-ecosystem.code-workspace       # VS Code workspace config
```

### Important Files to Know

**Primary Source Files:**
- `src/Code.gs` - All application logic lives here (calendar, employees, assignments, venues, API)
- `src/ui.html` - Complete web interface with embedded CSS/JS
- `src/DiagnosesEmployees.gs` - Testing and diagnostic functions

**Configuration:**
- `.clasp.json` - Contains Google Apps Script project ID (gitignored, sensitive)
- `appsscript.json` - Apps Script manifest (gitignored)
- `package.json` - NPM scripts for clasp commands

**Documentation Priority:**
1. `README.md` - Start here for project overview
2. `docs/API_REFERENCE.md` - Complete function documentation
3. `docs/COMPREHENSIVE_AUDIT_REPORT.md` - Security audit findings
4. `docs/deployment/DEPLOYMENT.md` - How to deploy

---

## Technology Stack & Architecture

### Backend
- **Runtime**: Google Apps Script (V8 Engine)
- **Language**: JavaScript ES5/ES6
- **APIs**:
  - `SpreadsheetApp` - Google Sheets integration
  - `CalendarApp` - Google Calendar integration
  - `HtmlService` - Web app serving
  - `Logger` - Logging service

### Frontend
- **Framework**: Vanilla JavaScript (no frameworks)
- **Styling**: CSS3 with CSS Variables
- **Fonts**: Inter, Manrope, JetBrains Mono (Google Fonts)
- **Architecture**: Server-side rendering with client-side interactivity

### Data Storage
Google Sheets acts as the database with 4 sheets:

1. **Settings** - Key-value configuration pairs
2. **Employees** - Staff directory with phone numbers
3. **Assignments** - Event-staff mappings with time slots
4. **Venues** - Location database (auto-created)

### Integration Points
- **Google Calendar** - Event fetching, multi-day event support
- **Google Sheets** - Data persistence, real-time updates
- **Google Maps** - Automatic map link generation
- **Future/Referenced**: Twilio SMS (group chat feature prepared but not active)

### Architecture Pattern
This is a **server-side MVC pattern**:
- **Model**: Google Sheets (Settings, Employees, Assignments, Venues)
- **View**: ui.html (rendered server-side, enhanced client-side)
- **Controller**: Code.gs functions (business logic, API endpoints)

**Client-Server Communication:**
```javascript
// Client side (ui.html)
google.script.run
  .withSuccessHandler(handleSuccess)
  .withFailureHandler(handleError)
  .api_functionName(params);

// Server side (Code.gs)
function api_functionName(params) {
  // Process and return data
  return result;
}
```

---

## Development Workflow

### Setup & Authentication

1. **Install clasp** (Google's CLI for Apps Script):
   ```bash
   npm install
   npm run login  # Authenticate with Google
   ```

2. **Link to Apps Script Project**:
   - `.clasp.json` contains project ID (gitignored)
   - Get project ID from: https://script.google.com → Your Project → Settings

3. **Pull Latest from Apps Script**:
   ```bash
   npm run pull   # Downloads from Apps Script to local
   ```

### Development Cycle

```bash
# 1. Edit files locally in src/ directory
vim src/Code.gs

# 2. Push changes to Apps Script
npm run push

# 3. Test via Apps Script UI
npm run open   # Opens Apps Script editor in browser

# 4. Deploy web app (through Apps Script UI)
# Project → Deploy → Manage deployments → Edit deployment

# 5. View logs
npm run logs   # Shows execution logs
```

### Available NPM Scripts (package.json:6-12)

```json
{
  "login": "clasp login",      // Authenticate with Google
  "push": "clasp push",        // Upload local → Apps Script
  "pull": "clasp pull",        // Download Apps Script → local
  "deploy": "clasp deploy",    // Create new deployment
  "open": "clasp open",        // Open project in browser
  "logs": "clasp logs"         // View execution logs
}
```

### Testing Workflow

**Automated Tests** (Code.gs:1008-1172):
1. Open Google Sheets bound to this script
2. Menu: "🧪 CupsUp Tests" → "RUN ALL TESTS"
3. Review results in modal dialog

**Individual Diagnostics**:
- Menu: "🧪 CupsUp Tests" → Individual test functions
- Functions: `test_settings()`, `test_employees()`, `test_calendar()`, etc.

**Local Validation**:
```bash
node scripts/test-validation.js
```

### Git Workflow

**Current Branch**: `claude/claude-md-mibztuzepg9qh224-014tvgEekYFzez68wAChYY6w`

```bash
# Make changes
git add .
git commit -m "feat: descriptive commit message"

# Push to feature branch
git push -u origin claude/claude-md-mibztuzepg9qh224-014tvgEekYFzez68wAChYY6w

# Network retry logic: Up to 4 retries with exponential backoff (2s, 4s, 8s, 16s)
```

**CRITICAL GIT RULES:**
- ✅ ALWAYS push to branches starting with `claude/`
- ❌ NEVER push to main/master without permission
- ❌ NEVER use `--force` without explicit user request
- ❌ NEVER update git config
- ✅ Use retry logic for network failures (4 attempts with backoff)

---

## Naming Conventions & Patterns

### Function Naming

**Prefix Patterns** (Code.gs):

```javascript
// API endpoints (client-callable)
function api_getBootstrap() {}
function api_saveAssignment() {}

// Testing functions
function test_settings() {}
function test_employees() {}

// Retrieval functions
function getSettings() {}
function getVenues() {}

// Persistence functions
function saveAssignment() {}
function saveVenue() {}

// Validation functions
function validateEmployeePhone() {}
function validateAssignmentData() {}

// Diagnostic functions (DiagnosesEmployees.gs)
function diagnoseTabs() {}
function diagnoseSettings() {}
```

### Variable Naming

```javascript
// Constants (UPPER_SNAKE_CASE)
const DB_SHEET = {
  SETTINGS: 'Settings',
  EMPLOYEES: 'Employees',
  ASSIGN: 'Assignments',
  VENUES: 'Venues'
};

// Local variables (camelCase)
const weekStartIso = '2025-01-06';
const eventData = fetchWeekEvents(weekStartIso);

// Object properties (PascalCase in data structures)
const employee = {
  Name: 'John Doe',
  Phone: '+15551234567',
  Role: 'Barista'
};
```

### Date/Time Formats

```javascript
// ISO Date: YYYY-MM-DD
const date = '2025-01-06';

// ISO Time: HH:MM (24-hour)
const time = '14:30';

// Display Time: 12-hour with am/pm
const displayTime = '2:30pm';

// Helper functions (Code.gs:1003-1006)
function isoDate(date) {
  return Utilities.formatDate(date, tz, 'yyyy-MM-dd');
}

function isoTime(date) {
  return Utilities.formatDate(date, tz, 'HH:mm');
}
```

### CSS Naming (ui.html, scheduler-dark-theme.html)

```css
/* BEM-like patterns */
.event-card { }
.event-title { }
.location-link { }

/* Utility classes */
.btn-fetch-week { }
.btn-save-assignments { }

/* CSS Variables */
--warm-950
--sauce-600
--bg-base
```

### Sheet Structure Naming

All sheets use **title case** with specific column names:

**Settings Sheet**: `Key | Value`
**Employees Sheet**: `Name | Phone | Role | Notes`
**Assignments Sheet**: `WeekStart | EventId | EventTitle | Date | Start | End | City | State | Assigned | SMSStatus | FullAddress | Notes`
**Venues Sheet**: `Name | Address | City | State | Notes`

---

## Data Models

### Employee Entity (Code.gs:240-280)

```javascript
{
  Name: string,      // Max 50 chars, required
  Phone: string,     // E.164 format: +1XXXXXXXXXX (exactly 12 chars)
  Role: string,      // e.g., "Barista", "Manager"
  Notes: string      // Optional metadata
}
```

**Validation Rules**:
- Phone must match E.164 format: `+1` followed by 10 digits
- No duplicate phone numbers allowed
- Name required, non-empty
- Phone validated via `validateEmployeePhone()` (Code.gs:281-315)

### Event Entity (Code.gs:91-145)

```javascript
{
  id: string,           // Google Calendar event ID
  title: string,        // Max 100 chars
  date: string,         // ISO format: YYYY-MM-DD
  endDate: string|null, // For multi-day events
  start: string,        // HH:MM (24-hour)
  end: string,          // HH:MM (24-hour)
  isMultiDay: boolean,  // Spans multiple days
  dayCount: number,     // Number of days
  city: string,         // Extracted from location
  state: string,        // 2-letter code (e.g., "TX")
  locationRaw: string,  // Original calendar location
  fullAddress: string,  // Complete address (venue lookup)
  mapLink: string,      // Google Maps URL
  venueSource: string   // 'calendar', 'database', or null
}
```

**Event Filtering** (Code.gs:126-131):
```javascript
// Excluded patterns (case-insensitive)
const excludePatterns = ['PTO', 'needs off', 'personal', 'vacation', 'sick'];
```

### Assignment Entity (Code.gs:475-570)

**Individual Assignment**:
```javascript
{
  name: string,     // Employee name (must exist in Employees sheet)
  start: string,    // HH:MM (individual start time for this employee)
  end: string       // HH:MM (individual end time for this employee)
}
```

**Storage Format** (Assignments sheet, "Assigned" column):
```javascript
// Comma-separated string
"John Doe:09:00-13:00, Jane Smith:13:00-17:00"
```

**Spreadsheet Row** (12 columns):
```javascript
[
  weekStart,      // ISO date: YYYY-MM-DD
  eventId,        // Calendar event ID
  eventTitle,     // Event name (max 100 chars)
  date,           // Event date
  start,          // Event start time
  end,            // Event end time
  city,           // Location city
  state,          // Location state (2-letter)
  assignedData,   // Comma-separated assignments
  smsStatus,      // Send timestamp or empty
  fullAddress,    // Complete venue address
  notes           // Event notes (max 500 chars)
]
```

### Venue Entity (Code.gs:375-450)

```javascript
{
  name: string,      // Venue name (unique identifier)
  address: string,   // Full street address
  city: string,      // City name
  state: string,     // 2-letter state code
  notes: string      // e.g., "Auto-saved from calendar"
}
```

**Auto-Save Logic** (Code.gs:147-180):
- Calendar events with city/state trigger venue lookup
- If not found in Venues sheet, auto-create entry
- Venue matched by event title (case-insensitive)

### Settings Configuration (Code.gs:51-89)

```javascript
{
  CALENDAR_ID: string,           // Google Calendar email/ID
  TIMEZONE: string,              // IANA timezone (e.g., "America/New_York")
  GROUP_CHAT_NUMBERS: string     // Comma-separated +1XXXXXXXXXX
}
```

**Required Settings** (validated in tests):
- CALENDAR_ID must be valid Google Calendar
- TIMEZONE must be valid IANA identifier
- GROUP_CHAT_NUMBERS must be E.164 format

---

## Critical Implementation Details

### 1. Multi-Day Event Handling (Code.gs:106-145)

**Challenge**: Google Calendar multi-day events span multiple dates but should only appear once.

**Solution**:
```javascript
// Check if event spans multiple days
const isMultiDay = startDate !== endDate;
const dayCount = isMultiDay
  ? Math.round((end - start) / (1000*60*60*24)) + 1
  : 1;

// Display only on first day
const ev = {
  date: startDate,      // First day
  endDate: endDate,     // Last day
  isMultiDay: true,
  dayCount: dayCount,
  // ... other fields
};
```

**UI Display** (ui.html:395-400):
```javascript
if (ev.isMultiDay) {
  dateStr += ` <span class="multi-day">(${ev.dayCount} days: ${ev.date} to ${ev.endDate})</span>`;
}
```

### 2. Individual Time Slots (Code.gs:475-570)

**Feature**: Each staff member can have different start/end times for the same event.

**Format**:
```javascript
// Event: 9am-5pm
// Assignments:
"John Doe:09:00-13:00, Jane Smith:13:00-17:00"

// John works 9am-1pm
// Jane works 1pm-5pm
```

**Parsing** (Code.gs:509-540):
```javascript
function parseAssignedData(assignedStr) {
  if (!assignedStr) return [];

  return assignedStr.split(',').map(part => {
    const [nameTime] = part.trim().split(':');
    const [start, end] = (part.split(':')[1] || '').split('-');

    return {
      name: nameTime,
      start: start || '',
      end: end || ''
    };
  });
}
```

### 3. Location Parsing (Code.gs:147-180)

**Challenge**: Extract city/state from free-form calendar location strings.

**Approach**:
```javascript
function parseCityState(location) {
  if (!location) return { city: '', state: '' };

  // Extract pattern: "City, ST" or "1234 Street, City, ST"
  const parts = location.split(',').map(p => p.trim());

  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    const stateMatch = lastPart.match(/\b([A-Z]{2})\b/);

    if (stateMatch) {
      return {
        state: stateMatch[1],
        city: parts[parts.length - 2]
      };
    }
  }

  return { city: '', state: '' };
}
```

### 4. Phone Number Validation (Code.gs:281-315)

**Format**: Strict E.164 international format.

```javascript
function validateEmployeePhone(phone, employeeName) {
  // Required format: +1XXXXXXXXXX (exactly 12 characters)
  const e164Pattern = /^\+1\d{10}$/;

  if (!e164Pattern.test(phone)) {
    throw new Error(
      `Invalid phone format for ${employeeName}: "${phone}"\n` +
      `Required format: +1XXXXXXXXXX (e.g., +15551234567)`
    );
  }

  return true;
}
```

**Auto-Fix Utility** (Code.gs:317-350):
```javascript
function fixEmployeePhoneNumbers() {
  // Converts formats like:
  // "(555) 123-4567" → "+15551234567"
  // "555-123-4567"   → "+15551234567"
}
```

### 5. XSS Protection (ui.html:170-180)

**All dynamic content must be sanitized**:

```javascript
function sanitizeHTML(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = String(text);  // Converts to text (no HTML parsing)
  return div.innerHTML;            // Returns escaped HTML entities
}

// Usage
div.innerHTML = `
  <div class="event-title">${sanitizeHTML(ev.title)}</div>
  <div class="location">${sanitizeHTML(location)}</div>
`;
```

**Why**: Prevents malicious calendar events from injecting JavaScript.

**Example Attack Prevented**:
```javascript
// Malicious calendar event title:
"<img src=x onerror='alert(document.cookie)'>"

// Without sanitization: XSS attack executed
// With sanitization: Displays as literal text
```

### 6. Venue Auto-Save (Code.gs:147-180, 375-450)

**Flow**:
1. Fetch calendar events
2. Parse city/state from location
3. Lookup venue by event title
4. If not found → auto-create venue entry
5. Attach venue data to event

**Benefits**:
- Historical venue database builds automatically
- Faster future lookups
- Consistent address data

**Code** (Code.gs:147-180):
```javascript
const venues = getVenues();
const venueData = lookupVenue(title, venues);

if (venueData) {
  ev.fullAddress = venueData.address;
  ev.venueSource = 'database';
} else if (city && state) {
  // Auto-save new venue
  saveVenue({
    name: title,
    address: location,
    city: city,
    state: state,
    notes: 'Auto-saved from calendar'
  });
}
```

### 7. Assignment Validation (Code.gs:600-700)

**10 Validation Checks** (validateAssignmentData):

1. ✅ Event exists (eventId must be valid)
2. ✅ Employee exists (name must be in Employees sheet)
3. ✅ Time format valid (HH:MM 24-hour)
4. ✅ Time logic valid (start < end)
5. ✅ String lengths (title ≤100, notes ≤500)
6. ✅ No duplicates (employee assigned once per event)
7. ✅ No overlap (employee time slots don't overlap)
8. ✅ State code valid (2-letter uppercase)
9. ✅ Required fields (weekStart, eventId, title, date)
10. ✅ ISO date format (YYYY-MM-DD)

**Example Validation** (Code.gs:645-665):
```javascript
// Check for duplicate assignments
const names = [];
for (const a of assignments) {
  if (names.includes(a.name)) {
    throw new Error(`Employee "${a.name}" assigned multiple times`);
  }
  names.push(a.name);
}

// Check for time overlaps
for (let i = 0; i < assignments.length; i++) {
  for (let j = i + 1; j < assignments.length; j++) {
    if (timeOverlap(assignments[i], assignments[j])) {
      throw new Error(
        `Time overlap: ${assignments[i].name} and ${assignments[j].name}`
      );
    }
  }
}
```

---

## Testing Strategy

### Automated Test Suite (Code.gs:1008-1172)

**6 Comprehensive Tests**:

```javascript
function runAutomatedTests() {
  const tests = [
    test_sheetStructure,         // Verifies Settings, Employees, Assignments exist
    test_settings,               // Validates CALENDAR_ID, TIMEZONE, GROUP_CHAT_NUMBERS
    test_calendarAccess,         // Confirms calendar permissions
    test_employeeData,           // Validates phone format (+1XXXXXXXXXX)
    test_fetchEvents,            // Tests calendar event retrieval
    test_groupChatSetup          // Validates recipient configuration
  ];

  // Run all tests, collect results
  // Display formatted results in UI
}
```

**Access**: Custom menu "🧪 CupsUp Tests" → "RUN ALL TESTS"

**Result Format**:
```
═══════════════════════════════════════
   CUPSUP SCHEDULER - TEST RESULTS
═══════════════════════════════════════
✅ Test 1: Sheet Structure - PASSED
✅ Test 2: Settings Configuration - PASSED
✅ Test 3: Calendar Access - PASSED
✅ Test 4: Employee Data Validation - PASSED
✅ Test 5: Fetch Events - PASSED
✅ Test 6: Group Chat Setup - PASSED

✅ Passed: 6
❌ Failed: 0
⚠️  Warnings: 0
```

### Individual Diagnostics (DiagnosesEmployees.gs:1-64)

**4 Diagnostic Functions**:

```javascript
function diagnoseTabs() {
  // Verifies sheet structure
  // Lists all sheets, highlights missing tabs
}

function diagnoseSettings() {
  // Validates settings configuration
  // Shows current values, identifies issues
}

function diagnoseEmployees() {
  // Tests employee data loading
  // Validates phone numbers, checks duplicates
}

function runFullDiagnostic() {
  // Runs all diagnostics
  // Comprehensive system health check
}
```

**Access**: Custom menu "🧪 CupsUp Tests" → Individual functions

### Local Testing (scripts/test-validation.js)

**Node.js validation**:
```bash
node scripts/test-validation.js
```

**Checks**:
- Syntax validation
- Function presence verification
- Structure validation
- Code quality metrics

### Testing Best Practices

**When modifying code**:
1. ✅ Always run automated tests after changes
2. ✅ Test with real calendar data (multi-day events)
3. ✅ Test phone validation with various formats
4. ✅ Test assignment validation (duplicates, overlaps)
5. ✅ Test XSS protection with malicious inputs
6. ✅ Verify logs for errors: `npm run logs`

**Before deployment**:
1. ✅ Run full test suite (all 6 tests pass)
2. ✅ Test web UI in incognito mode
3. ✅ Verify Settings sheet configuration
4. ✅ Test with production calendar
5. ✅ Check security headers (XFrame: DENY)

---

## Security Considerations

### Security Grade: A- (95/100)

All critical and high-priority security issues have been resolved. See `docs/COMPREHENSIVE_AUDIT_REPORT.md` for full audit.

### Critical Security Measures (Implemented)

#### 1. XSS Protection (ui.html:170-180)

**Issue**: Malicious calendar events could inject JavaScript.

**Solution**: HTML sanitization on all dynamic content.

```javascript
function sanitizeHTML(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// ALWAYS use for dynamic content
${sanitizeHTML(ev.title)}
${sanitizeHTML(location)}
```

**Attack Prevented**:
```javascript
// Attacker creates event with title:
"<img src=x onerror='alert(document.cookie)'>"

// Without sanitization: XSS executed
// With sanitization: Displays as plain text
```

#### 2. XFrame Protection (Code.gs:16)

**Issue**: Clickjacking attacks via malicious iframes.

**Solution**: DENY mode for XFrame options.

```javascript
HtmlService.createTemplateFromFile('ui')
  .evaluate()
  .setTitle('CupsUp Scheduler')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DENY);
```

**Attack Prevented**: App cannot be embedded in iframes.

#### 3. Phone Number Validation (Code.gs:281-315)

**Issue**: Invalid phone formats cause SMS failures.

**Solution**: Strict E.164 validation.

```javascript
const e164Pattern = /^\+1\d{10}$/;

// Valid:   +15551234567
// Invalid: (555) 123-4567
// Invalid: 555-123-4567
// Invalid: 15551234567 (missing +)
```

#### 4. Input Validation (Code.gs:600-700)

**10 Validation Rules**:
1. Required fields present
2. String length limits (title ≤100, notes ≤500)
3. Date format (YYYY-MM-DD)
4. Time format (HH:MM)
5. Time logic (start < end)
6. Employee exists
7. Event exists
8. No duplicate assignments
9. No time overlaps
10. State code valid (2-letter)

#### 5. Cost Protection

**SMS Rate Limiting** (referenced in audit):
- 60-second cooldown between sends
- Daily send limits recommended
- Recipient count warnings

### Security Best Practices for AI Assistants

**When modifying code**:
1. ❌ NEVER remove `sanitizeHTML()` calls
2. ❌ NEVER change XFrame mode from DENY
3. ❌ NEVER weaken phone validation
4. ❌ NEVER skip input validation
5. ✅ ALWAYS sanitize user input
6. ✅ ALWAYS validate data before saving
7. ✅ ALWAYS use parameterized queries (avoid string concatenation)

**Sensitive Data**:
- `.clasp.json` contains project ID (gitignored)
- `appsscript.json` may contain credentials (gitignored)
- Settings sheet contains CALENDAR_ID (sensitive)
- Employee phone numbers (PII - handle carefully)

**Code Review Checklist**:
- [ ] All dynamic HTML uses `sanitizeHTML()`
- [ ] XFrame protection enabled (DENY mode)
- [ ] Phone validation enforced (E.164)
- [ ] Input validation comprehensive
- [ ] No SQL/NoSQL injection vectors
- [ ] Error messages don't leak sensitive data
- [ ] Rate limiting in place for expensive operations

---

## Common Tasks Guide

### Task: Add a New API Endpoint

**Steps**:

1. **Create server function** in `Code.gs`:
   ```javascript
   function api_newEndpoint(params) {
     try {
       // 1. Validate inputs
       if (!params || !params.requiredField) {
         throw new Error('Missing required field');
       }

       // 2. Business logic
       const result = processData(params);

       // 3. Return data
       return result;

     } catch (error) {
       Logger.log('api_newEndpoint error: ' + error);
       throw error;
     }
   }
   ```

2. **Call from client** in `ui.html`:
   ```javascript
   google.script.run
     .withSuccessHandler(function(result) {
       console.log('Success:', result);
     })
     .withFailureHandler(function(error) {
       console.error('Error:', error);
       alert('Error: ' + error.message);
     })
     .api_newEndpoint({ requiredField: 'value' });
   ```

3. **Test**:
   - Push code: `npm run push`
   - Test in web UI
   - Check logs: `npm run logs`

### Task: Add a New Sheet Column

**Steps**:

1. **Manually add column** in Google Sheets (e.g., add "Email" to Employees)

2. **Update data loading** in `Code.gs`:
   ```javascript
   function listEmployees() {
     const sheet = getSheet(DB_SHEET.EMPLOYEES);
     const rows = sheet.getDataRange().getValues();
     const [headers, ...dataRows] = rows;

     return dataRows.map(row => ({
       Name: row[0],
       Phone: row[1],
       Role: row[2],
       Notes: row[3],
       Email: row[4]  // NEW COLUMN
     }));
   }
   ```

3. **Update validation** if needed:
   ```javascript
   function validateEmail(email) {
     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailPattern.test(email)) {
       throw new Error('Invalid email format');
     }
   }
   ```

4. **Update UI** in `ui.html` to display new field

5. **Test**:
   - Run `test_employees()` to verify loading
   - Check UI display

### Task: Modify Event Filtering

**Location**: `Code.gs:126-131`

**Current**:
```javascript
const excludePatterns = ['PTO', 'needs off', 'personal', 'vacation', 'sick'];
```

**To modify**:
```javascript
// Add new patterns
const excludePatterns = [
  'PTO', 'needs off', 'personal', 'vacation', 'sick',
  'training',    // NEW
  'meeting'      // NEW
];

// Events with these in title will be filtered out
```

### Task: Change UI Theme Colors

**Location**: `src/scheduler-dark-theme.html:1-100`

**CSS Variables**:
```css
:root {
  /* Warm tones (browns/oranges) */
  --warm-50: #fefdfb;
  --warm-600: #d97706;
  --warm-950: #451a03;

  /* Sauce accent (oranges) */
  --sauce-400: #fb923c;
  --sauce-600: #ea580c;

  /* Background */
  --bg-base: #0a0a0a;
  --bg-elevated: #1a1a1a;
}
```

**To modify**: Change hex values, save, push, deploy.

### Task: Add a New Validation Rule

**Location**: `Code.gs:600-700` (validateAssignmentData)

**Example**: Add maximum assignments per event

```javascript
function validateAssignmentData(data) {
  // ... existing validations ...

  // NEW VALIDATION: Max 5 staff per event
  if (data.assignments && data.assignments.length > 5) {
    throw new Error('Maximum 5 staff members per event');
  }

  return true;
}
```

### Task: Debug a Production Issue

**Steps**:

1. **Check execution logs**:
   ```bash
   npm run logs
   ```

2. **Run diagnostics** in Google Sheets:
   - Menu: "🧪 CupsUp Tests" → "RUN ALL TESTS"
   - Menu: "🧪 CupsUp Tests" → Individual diagnostics

3. **Check Settings sheet**:
   - CALENDAR_ID valid?
   - TIMEZONE correct?
   - GROUP_CHAT_NUMBERS formatted correctly?

4. **Verify sheet structure**:
   - Settings, Employees, Assignments, Venues sheets exist?
   - Column headers correct?

5. **Test calendar access**:
   - Run `test_calendarAccess()`
   - Verify calendar permissions

6. **Add debug logging**:
   ```javascript
   Logger.log('Debug: weekStartIso = ' + weekStartIso);
   Logger.log('Debug: events count = ' + events.length);
   ```

7. **View logs**: `npm run logs`

---

## Gotchas & Important Notes

### Google Apps Script Limitations

1. **Execution Time Limit**: 6 minutes max
   - Large calendar fetches may timeout
   - Consider batching for >500 events

2. **Quota Limits**:
   - Calendar API: 5,000 calls/day (consumer)
   - Spreadsheet reads: 20,000/day
   - See: https://developers.google.com/apps-script/guides/services/quotas

3. **V8 Runtime Required**:
   - Modern JavaScript features require V8
   - Check: Apps Script editor → Settings → V8 enabled

4. **No External Libraries**:
   - Cannot use npm packages
   - All code must be vanilla JavaScript
   - External APIs must use `UrlFetchApp`

### Data Consistency Issues

1. **Sheet Modifications**:
   - ❌ Don't rename sheets (breaks `DB_SHEET` constants)
   - ❌ Don't reorder columns (breaks array indexing)
   - ✅ Add columns at end (safer)

2. **Manual Data Entry**:
   - Phone numbers MUST be +1XXXXXXXXXX format
   - Dates MUST be YYYY-MM-DD format
   - Times MUST be HH:MM format
   - Running `fixEmployeePhoneNumbers()` auto-fixes common formats

3. **Calendar Permissions**:
   - Script must have calendar access
   - Test with `test_calendarAccess()`
   - Reauthorize if permissions change

### Common Errors & Solutions

**Error**: "Cannot find method getSheet"
- **Cause**: Sheet name doesn't match `DB_SHEET` constants
- **Solution**: Verify sheet names in Google Sheets

**Error**: "Invalid phone format"
- **Cause**: Phone not in E.164 format
- **Solution**: Run `fixEmployeePhoneNumbers()` or manually fix

**Error**: "Calendar access denied"
- **Cause**: Insufficient permissions
- **Solution**: Reauthorize script (Edit → Current project's triggers)

**Error**: "Maximum execution time exceeded"
- **Cause**: Large calendar fetch (>500 events)
- **Solution**: Reduce date range or implement pagination

**Error**: "XSS vulnerability detected"
- **Cause**: Missing `sanitizeHTML()` call
- **Solution**: Always sanitize dynamic HTML content

### Performance Considerations

1. **Venue Lookups**:
   - Currently O(n) linear search
   - Consider caching for >100 venues
   - Auto-save builds database automatically

2. **Assignment Reads**:
   - Loads entire Assignments sheet
   - Filter by week client-side
   - Optimize for >1000 assignments

3. **Calendar Fetches**:
   - Fetches entire week at once
   - Caching recommended for repeated views
   - Consider background refresh

### Deployment Gotchas

1. **Web App URL Changes**:
   - New deployment = new URL
   - Use "Manage deployments" → Edit existing deployment
   - Avoids breaking shared links

2. **Authorization Required**:
   - First deploy requires OAuth consent
   - Users must authorize app
   - Test with service account for automation

3. **Caching Issues**:
   - Apps Script caches aggressively
   - Clear cache: Apps Script editor → View → Show manifest file → Change version
   - Or use new deployment

### Code Maintenance

1. **Don't Break APIs**:
   - `api_*` functions are public contracts
   - Changing signatures breaks UI
   - Add new functions instead of modifying

2. **Preserve Data Models**:
   - Changing column order breaks code
   - Changing field names breaks parsing
   - Add new fields at end

3. **Test After Changes**:
   - Always run automated tests
   - Test with production data
   - Verify logs for errors

---

## Quick Reference Commands

```bash
# Development
npm run push          # Upload local → Apps Script
npm run pull          # Download Apps Script → local
npm run open          # Open Apps Script editor
npm run logs          # View execution logs

# Git (current branch: claude/claude-md-mibztuzepg9qh224-014tvgEekYFzez68wAChYY6w)
git add .
git commit -m "feat: description"
git push -u origin claude/claude-md-mibztuzepg9qh224-014tvgEekYFzez68wAChYY6w

# Testing
# Menu: "🧪 CupsUp Tests" → "RUN ALL TESTS"
# Or individual: test_settings(), test_employees(), etc.

# Local validation
node scripts/test-validation.js

# Deployment
# Apps Script UI → Deploy → Manage deployments → Edit
```

---

## Important File Locations

| Purpose | File Path | Lines |
|---------|-----------|-------|
| Main application | `src/Code.gs` | 1,474 |
| Web interface | `src/ui.html` | 641 |
| Diagnostics | `src/DiagnosesEmployees.gs` | 64 |
| API docs | `docs/API_REFERENCE.md` | 765 |
| Security audit | `docs/COMPREHENSIVE_AUDIT_REPORT.md` | 1,200+ |
| Deployment guide | `docs/deployment/DEPLOYMENT.md` | - |
| Quick reference | `docs/development/CLAUDE_CODE_CHEATSHEET.md` | 147 |

---

## Key Constants Reference

```javascript
// Sheet names (Code.gs:25-30)
const DB_SHEET = {
  SETTINGS: 'Settings',
  EMPLOYEES: 'Employees',
  ASSIGN: 'Assignments',
  VENUES: 'Venues'
};

// Validation patterns (Code.gs:281-315)
const PHONE_PATTERN = /^\+1\d{10}$/;  // E.164 format

// Event filtering (Code.gs:126-131)
const EXCLUDE_PATTERNS = ['PTO', 'needs off', 'personal', 'vacation', 'sick'];

// String limits (Code.gs:600-700)
const MAX_TITLE_LENGTH = 100;
const MAX_NOTES_LENGTH = 500;
const MAX_NAME_LENGTH = 50;

// Date/time formats
// ISO Date: YYYY-MM-DD
// ISO Time: HH:MM (24-hour)
// Display Time: h:mma (12-hour)
```

---

## Additional Resources

### Documentation
- **README.md** - Project overview & setup
- **docs/API_REFERENCE.md** - Complete function documentation
- **docs/COMPREHENSIVE_AUDIT_REPORT.md** - Security audit (42 issues)
- **docs/deployment/DEPLOYMENT.md** - Deployment guide
- **docs/USER_GUIDE.md** - End-user manual

### Development Guides
- **docs/development/CLAUDE_CODE_CHEATSHEET.md** - Quick reference
- **docs/development/OptDevWorkflow.md** - Optimized workflow
- **docs/development/claude-code-optimization.md** - 93% token reduction

### Security
- **docs/security/SECURITY_ANALYSIS.md** - Security review
- **docs/COMPREHENSIVE_AUDIT_REPORT.md** - Complete audit

### External Links
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Clasp Documentation](https://github.com/google/clasp)
- [Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)

---

## Changelog

**November 23, 2025** - Initial CLAUDE.md creation
- Comprehensive codebase analysis
- Complete architecture documentation
- Security considerations documented
- Common tasks guide added
- Gotchas and best practices included

---

## Contact & Support

**Repository**: `/home/user/cupsup-scheduler`
**License**: MIT
**Status**: ✅ Production Ready
**Security Grade**: A- (95/100)

For issues, questions, or contributions, refer to the comprehensive documentation in the `docs/` directory.

---

*This file was generated to assist AI assistants (like Claude) in understanding and working with the CupsUp Scheduler codebase. It provides comprehensive context for development, testing, debugging, and deployment tasks.*
