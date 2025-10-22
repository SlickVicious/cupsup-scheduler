# CupsUp Scheduler API Reference

Complete reference for all functions and API endpoints in the CupsUp Scheduler system.

## Table of Contents

1. [Core Functions](#core-functions)
2. [API Methods](#api-methods)
3. [Utility Functions](#utility-functions)
4. [Data Structures](#data-structures)

## Core Functions

### `doGet(e)`

Entry point for the web application.

**Parameters:**
- `e` (Object): Event object passed by Google Apps Script

**Returns:**
- `HtmlOutput`: The rendered UI

**Example:**
```javascript
// Automatically called when accessing web app URL
// No manual invocation needed
```

---

### `getSettings()`

Retrieves all configuration settings from the Settings sheet and Script Properties.

**Returns:**
- `Object`: Configuration object containing:
  - `CALENDAR_ID` (string): Google Calendar ID
  - `TIMEZONE` (string): IANA timezone name
  - `TWILIO_FROM` (string): Twilio phone number
  - `GROUP_CHAT_NUMBERS` (string): Comma-separated recipient numbers
  - `TWILIO_SID` (string): Twilio Account SID (from Script Properties)
  - `TWILIO_AUTH` (string): Twilio Auth Token (from Script Properties)

**Throws:**
- `Error`: If Settings sheet not found or empty

**Example:**
```javascript
const settings = getSettings();
console.log(settings.CALENDAR_ID);  // "your-calendar@group.calendar.google.com"
```

---

### `listEmployees()`

Fetches all employee records from the Employees sheet.

**Returns:**
- `Array<Object>`: Array of employee objects:
  ```javascript
  {
    Name: string,
    Phone: string,  // E.164 format: +1XXXXXXXXXX
    Role: string,
    Notes: string
  }
  ```

**Example:**
```javascript
const employees = listEmployees();
// [
//   {Name: "John Doe", Phone: "+15551234567", Role: "Barista", Notes: "Morning"},
//   {Name: "Jane Smith", Phone: "+15559876543", Role: "Manager", Notes: "Team lead"}
// ]
```

---

### `fetchWeekEvents(weekStartIso)`

Retrieves all calendar events for a specific week.

**Parameters:**
- `weekStartIso` (string): ISO date string (YYYY-MM-DD) for Monday of the week

**Returns:**
- `Array<Object>`: Array of event objects:
  ```javascript
  {
    id: string,           // Google Calendar event ID
    title: string,        // Event title
    date: string,         // ISO date (YYYY-MM-DD)
    start: string,        // Time (HH:MM)
    end: string,          // Time (HH:MM)
    city: string,         // Parsed from location
    state: string,        // Parsed from location (2-letter code)
    locationRaw: string   // Full location string
  }
  ```

**Example:**
```javascript
const events = fetchWeekEvents('2025-01-06');
// [
//   {
//     id: "abc123",
//     title: "Coffee Popup",
//     date: "2025-01-06",
//     start: "09:00",
//     end: "17:00",
//     city: "New York",
//     state: "NY",
//     locationRaw: "123 Main St, New York, NY 10001"
//   }
// ]
```

---

### `getAssignments(weekStartIso)`

Retrieves all staff assignments for a specific week.

**Parameters:**
- `weekStartIso` (string): ISO date string (YYYY-MM-DD)

**Returns:**
- `Object`: Map of event IDs to assignment arrays:
  ```javascript
  {
    "eventId123": [
      {name: "John Doe", start: "09:00", end: "13:00"},
      {name: "Jane Smith", start: "13:00", end: "17:00"}
    ]
  }
  ```

**Example:**
```javascript
const assignments = getAssignments('2025-01-06');
// {
//   "abc123": [
//     {name: "John Doe", start: "09:00", end: "13:00"}
//   ]
// }
```

---

### `saveAssignment(weekStartIso, eventId, eventData, assignments)`

Saves staff assignments for an event.

**Parameters:**
- `weekStartIso` (string): ISO date for the week
- `eventId` (string): Google Calendar event ID
- `eventData` (Object): Event information
  ```javascript
  {
    title: string,
    date: string,
    start: string,
    end: string,
    city: string,
    state: string
  }
  ```
- `assignments` (Array): Staff assignments
  ```javascript
  [
    {name: string, start: string, end: string}
  ]
  ```

**Returns:**
- `Object`: Success status `{success: true}`

**Example:**
```javascript
saveAssignment(
  '2025-01-06',
  'abc123',
  {title: "Coffee Popup", date: "2025-01-06", start: "09:00", end: "17:00", city: "NYC", state: "NY"},
  [{name: "John Doe", start: "09:00", end: "13:00"}]
);
```

---

### `sendGroupChatSchedule(weekStartIso)`

Sends the weekly schedule via SMS to all configured recipients.

**Parameters:**
- `weekStartIso` (string): ISO date for the week

**Returns:**
- `Object`: Send status:
  ```javascript
  {
    count: number,        // Successfully sent
    numbers: number,      // Total recipients
    preview: string       // Message preview
  }
  ```

**Throws:**
- `Error`: If Twilio not configured
- `Error`: If no assignments found
- `Error`: If GROUP_CHAT_NUMBERS not set

**Example:**
```javascript
const result = sendGroupChatSchedule('2025-01-06');
// {count: 5, numbers: 5, preview: "☕ CUPSUP SCHEDULE..."}
```

---

## API Methods

These functions are exposed to the client-side JavaScript.

### `api_getBootstrap()`

Initial data load for the UI.

**Returns:**
- `Object`:
  ```javascript
  {
    settings: Object,    // From getSettings()
    employees: Array     // From listEmployees()
  }
  ```

**Client Usage:**
```javascript
google.script.run
  .withSuccessHandler(data => console.log(data))
  .api_getBootstrap();
```

---

### `api_getWeek(weekStartIso)`

Loads events and assignments for a specific week.

**Parameters:**
- `weekStartIso` (string): ISO date

**Returns:**
- `Object`:
  ```javascript
  {
    events: Array,        // From fetchWeekEvents()
    assignments: Object   // From getAssignments()
  }
  ```

**Client Usage:**
```javascript
google.script.run
  .withSuccessHandler(data => {
    console.log(data.events);
    console.log(data.assignments);
  })
  .api_getWeek('2025-01-06');
```

---

### `api_saveAssignment(weekStartIso, eventId, eventData, assignments)`

Client-side wrapper for saveAssignment().

**Client Usage:**
```javascript
google.script.run
  .withSuccessHandler(() => alert('Saved!'))
  .api_saveAssignment(
    '2025-01-06',
    'abc123',
    eventData,
    assignments
  );
```

---

### `api_sendGroupChat(weekStartIso)`

Client-side wrapper for sendGroupChatSchedule().

**Client Usage:**
```javascript
google.script.run
  .withSuccessHandler(result => {
    alert(`Sent to ${result.count} recipients`);
  })
  .api_sendGroupChat('2025-01-06');
```

---

## Utility Functions

### `getSpreadsheet()`

Returns the active spreadsheet.

**Returns:**
- `Spreadsheet`: Active Google Spreadsheet

---

### `getSheet(name)`

Gets a sheet by name.

**Parameters:**
- `name` (string): Sheet name

**Returns:**
- `Sheet`: Google Sheet object

---

### `isoDate(date)`

Formats a Date object as ISO date string.

**Parameters:**
- `date` (Date): JavaScript Date object

**Returns:**
- `string`: YYYY-MM-DD format

**Example:**
```javascript
isoDate(new Date('2025-01-06'))  // "2025-01-06"
```

---

### `isoTime(date)`

Formats a Date object as time string.

**Parameters:**
- `date` (Date): JavaScript Date object

**Returns:**
- `string`: HH:MM format (24-hour)

**Example:**
```javascript
isoTime(new Date('2025-01-06T14:30:00'))  // "14:30"
```

---

### `parseCityState(location)`

Extracts city and state from location string.

**Parameters:**
- `location` (string): Full address or location

**Returns:**
- `Object`: `{city: string, state: string}`

**Example:**
```javascript
parseCityState("123 Main St, New York, NY 10001")
// {city: "New York", state: "NY"}
```

---

### `twilioSend(sid, auth, from, to, body)`

Sends an SMS via Twilio API.

**Parameters:**
- `sid` (string): Twilio Account SID
- `auth` (string): Twilio Auth Token
- `from` (string): Sender phone number
- `to` (string): Recipient phone number
- `body` (string): Message text

**Throws:**
- `Error`: If Twilio API returns error

---

## Data Structures

### Settings Sheet Format

| Key | Value |
|-----|-------|
| CALENDAR_ID | your-calendar@group.calendar.google.com |
| TIMEZONE | America/New_York |
| TWILIO_FROM | +15551234567 |
| GROUP_CHAT_NUMBERS | +15559876543,+15551112222 |

### Employees Sheet Format

| Name | Phone | Role | Notes |
|------|-------|------|-------|
| John Doe | +15551234567 | Barista | Morning shift |
| Jane Smith | +15559876543 | Manager | Team lead |

### Assignments Sheet Format

| WeekStart | EventId | Title | Date | Start | End | City | State | Assigned | SentLog |
|-----------|---------|-------|------|-------|-----|------|-------|----------|---------|
| 2025-01-06 | abc123 | Coffee Popup | 2025-01-06 | 09:00 | 17:00 | New York | NY | John Doe:09:00-13:00, Jane Smith:13:00-17:00 | Group chat sent 2025-01-05T... |

### Assignment Data Format

Assignments are stored as comma-separated strings:
```
Name:HH:MM-HH:MM, Name:HH:MM-HH:MM
```

Example:
```
John Doe:09:00-13:00, Jane Smith:13:00-17:00
```

## Testing Functions

### `runAutomatedTests()`

Executes complete test suite.

**Returns:**
- `Object`:
  ```javascript
  {
    results: {
      timestamp: string,
      tests: Array,
      passed: number,
      failed: number,
      warnings: number
    },
    report: string  // Formatted text report
  }
  ```

### Individual Test Functions

- `test_settings()`: Validate settings configuration
- `test_employees()`: Validate employee data
- `test_calendar()`: Test calendar access
- `test_twilio_creds()`: Validate Twilio credentials
- `test_fetch_week()`: Test event fetching
- `test_group_numbers()`: Validate recipient numbers
- `test_send_to_me()`: Send test SMS

### Custom Menu Function

```javascript
onOpen()  // Creates "🧪 CupsUp Tests" menu on spreadsheet open
```

## Error Handling

All functions throw errors with descriptive messages:

```javascript
try {
  const settings = getSettings();
} catch (error) {
  console.error(error.message);
  // "Settings sheet not found"
  // "Settings sheet is empty"
  // "Cannot access calendar: ..."
}
```

## Rate Limits

### Google Apps Script Quotas

- Calendar API: 10,000 calls/day
- UrlFetch (Twilio): 20,000 calls/day
- Script runtime: 6 min/execution

### Twilio Limits

- Free tier: 500 SMS/month
- Paid accounts: Varies by plan
- Rate limiting: ~1 message/second

## Security Considerations

### Sensitive Data Storage

- ✅ **Script Properties**: TWILIO_SID, TWILIO_AUTH
- ❌ **Never in Settings sheet**: Twilio credentials
- ❌ **Never in code**: Hard-coded secrets

### Access Control

- Web app access controlled via deployment settings
- Sheet permissions separate from app permissions
- Twilio credentials only accessible server-side

## Version Information

- **Current Version**: 1.0.0
- **Google Apps Script Runtime**: V8
- **Twilio API**: 2010-04-01

---

For implementation examples, see [CupsUp Workflow Guide](./claude-code-cupsup-workflow.md)
