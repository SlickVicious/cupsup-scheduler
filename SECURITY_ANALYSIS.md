# CupsUp Scheduler - Security Analysis & Enhancement Recommendations

**Analysis Date:** October 22, 2025
**Version:** 1.0.0
**Reviewer:** Claude (AI Security Analyst)

---

## Executive Summary

The CupsUp Scheduler is a **well-designed micro-application** with good security practices for a Google Apps Script project. The code demonstrates:

✅ **Strong Points:**
- Proper credential separation (Script Properties vs. Settings sheet)
- Input validation for phone numbers and time formats
- Rate limiting on SMS sends
- Error handling throughout
- No obvious injection vulnerabilities

⚠️ **Areas for Improvement:**
- Missing CSRF protection
- No input sanitization for XSS
- Limited authorization controls
- No audit logging
- SMS cost protection could be stronger

🔴 **Security Gaps:**
- XFrame options set to ALLOWALL (clickjacking risk)
- No session management
- Weak rate limiting (1 minute cooldown)

---

## Security Analysis

### 1. Authentication & Authorization

#### Current State:
```javascript
function doGet(e) {
  return HtmlService.createTemplateFromFile('ui')
    .evaluate()
    .setTitle('CupsUp Scheduler')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // ⚠️ RISKY
}
```

#### Issues:
- **ALLOWALL XFrame Mode** - App can be embedded in any iframe (clickjacking risk)
- **No access controls** - Anyone with the URL can access if deployed as "Anyone"
- **No user session management** - Can't track who made what changes

#### Recommendations:
```javascript
// RECOMMENDED: Lock down iframe embedding
.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DENY);

// OR allow only specific domains:
.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.SAME_ORIGIN);
```

**Priority:** HIGH
**Effort:** Low (1 line change)

---

### 2. Cross-Site Scripting (XSS)

#### Vulnerable Areas:

**Code.gs - Line 318:**
```javascript
let message = `☕ CUPSUP SCHEDULE - ${formatDate(weekStart)} to ${formatDate(weekEnd)}\n\n`;
```
- If event titles contain malicious content from Google Calendar, they're included in SMS messages
- Not a browser XSS risk but could allow SMS injection

**ui.html - Line 337-338:**
```javascript
<div class="event-title">${ev.title}</div>
<div class="location">📍 ${location}</div>
```
- **Direct DOM insertion without sanitization**
- If calendar events have malicious HTML/JS in titles, it will execute

#### Attack Vector Example:
```javascript
// Malicious calendar event title:
title: "<img src=x onerror='alert(document.cookie)'>"

// Would execute JavaScript in the UI
```

#### Recommendations:
```javascript
// Sanitize before rendering:
function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Use in rendering:
<div class="event-title">${sanitizeHTML(ev.title)}</div>
```

**Priority:** HIGH
**Effort:** Medium

---

### 3. Credential Management

#### Current State (GOOD ✅):
```javascript
const props = PropertiesService.getScriptProperties();
obj.TWILIO_SID  = props.getProperty('TWILIO_SID') || '';
obj.TWILIO_AUTH = props.getProperty('TWILIO_AUTH') || '';
```

- Twilio credentials stored in Script Properties (encrypted by Google)
- Not exposed in Settings sheet
- Not logged or exposed to client

#### Minor Concerns:
```javascript
// Credentials logged on error (line 396):
Logger.log('Group chat errors: ' + JSON.stringify(errors));
// Could include sensitive Twilio error messages
```

#### Recommendations:
- Add credential rotation reminders
- Implement credential strength validation
- Sanitize logs to remove sensitive data

**Priority:** LOW
**Effort:** Low

---

### 4. Input Validation

#### Current Validation (GOOD ✅):

**Phone Number Validation:**
```javascript
if (!from.match(/^\+1\d{10}$/)) {
  throw new Error(`Invalid TWILIO_FROM format: ${from}. Must be +1XXXXXXXXXX`);
}
```

**Time Format Validation:**
```javascript
if (!a.start.match(/^\d{2}:\d{2}$/) || !a.end.match(/^\d{2}:\d{2}$/)) {
  throw new Error(`Assignment ${idx + 1}: Invalid time format. Use HH:MM`);
}
```

**Time Logic Validation:**
```javascript
if (a.start >= a.end) {
  throw new Error(`Assignment ${idx + 1}: Start time must be before end time`);
}
```

#### Missing Validations:

1. **Employee Name Length**
   - No max length check
   - Could cause SMS overflow

2. **Event Title Length**
   - Could exceed SMS limits (160 chars per segment)

3. **Assignment Count**
   - No limit on assignments per event
   - Could create massive SMS messages

#### Recommendations:
```javascript
// Validate assignment count
if (assignments.length > 10) {
  throw new Error('Maximum 10 staff assignments per event');
}

// Validate employee name length
if (a.name.length > 50) {
  throw new Error('Employee name too long (max 50 characters)');
}

// Validate total message size before sending
if (message.length > 1600) { // 10 SMS segments
  throw new Error('Schedule too large for single message (max 1600 chars)');
}
```

**Priority:** MEDIUM
**Effort:** Low

---

### 5. Rate Limiting & Cost Protection

#### Current Rate Limiting:
```javascript
const lastSend = props.getProperty('LAST_GROUP_CHAT_SEND');
if (lastSend) {
  const timeSince = Date.now() - parseInt(lastSend);
  if (timeSince < 60000) { // 1 minute cooldown
    throw new Error(`Please wait ${Math.ceil((60000 - timeSince) / 1000)} seconds...`);
  }
}
```

#### Issues:
- **Too short** - 1 minute allows 1,440 sends/day
- **No daily limit** - Could exhaust Twilio balance
- **No recipient limit** - Could send to unlimited numbers
- **No cost estimation** - Users unaware of charges

#### Recommendations:
```javascript
// Add daily send limit
const today = new Date().toISOString().slice(0, 10);
const dailySends = parseInt(props.getProperty('SENDS_' + today) || '0');

if (dailySends >= 10) {
  throw new Error('Daily send limit reached (10 messages/day). Reset at midnight.');
}

// Estimate cost
const estimatedCost = (numbers.length * 0.0079).toFixed(2); // Twilio pricing
if (numbers.length > 50) {
  throw new Error(`Large send detected: ${numbers.length} recipients (~$${estimatedCost}). Contact admin.`);
}

// Update counter
props.setProperty('SENDS_' + today, (dailySends + 1).toString());
```

**Priority:** HIGH (Cost protection)
**Effort:** Medium

---

### 6. Data Privacy & Compliance

#### Current State:

**Employee Data:**
- Names, phone numbers stored in Google Sheet
- No encryption (relying on Google's security)
- Accessible to anyone with sheet edit permissions

**SMS Logs:**
```javascript
sh.getRange(rowIndex + idx, 10).setValue('Group chat sent ' + timestamp);
```
- SMS send status logged in sheet
- No PII in logs (good)

#### GDPR/Privacy Concerns:

1. **No consent tracking** - No record of SMS opt-in
2. **No unsubscribe handling** - "Reply STOP" mentioned but not handled
3. **Data retention** - No policy for deleting old assignments
4. **No data export** - Employees can't easily get their data

#### Recommendations:

```javascript
// Add consent tracking sheet
// Columns: Name, Phone, ConsentDate, ConsentMethod, OptedOut

// Check consent before sending
function checkConsent(phoneNumber) {
  const consentSheet = getSheet('Consent');
  // Check if user has opted in and not opted out
}

// Handle STOP responses (requires Twilio webhook)
function handleIncomingSMS(request) {
  const body = request.parameter.Body.trim().toUpperCase();
  if (body === 'STOP') {
    // Mark user as opted out
  }
}
```

**Priority:** HIGH (Legal requirement in many jurisdictions)
**Effort:** High

---

### 7. Error Handling & Information Disclosure

#### Current Error Handling (GOOD ✅):
```javascript
try {
  return {
    settings: getSettings(),
    employees: listEmployees()
  };
} catch (e) {
  throw new Error(`Bootstrap failed: ${e.message}`);
}
```

#### Information Disclosure Risks:

**Detailed Error Messages:**
```javascript
// Line 427-442: Twilio errors exposed to client
errorMsg += `: ${errorData.message}`;
```
- Could reveal system details
- Helps attackers understand backend

#### Recommendations:
```javascript
// Generic errors for client, detailed logs for admin
catch (e) {
  Logger.log(`Detailed error: ${e.stack}`);
  throw new Error('An error occurred. Please contact support.');
}
```

**Priority:** LOW
**Effort:** Low

---

### 8. SQL/NoSQL Injection

#### Status: **NOT VULNERABLE** ✅

Google Sheets API doesn't use SQL, and all data access is via:
- `.getValues()` - Returns raw data
- `.setValues()` - Writes data directly

No string concatenation for queries.

---

### 9. Audit Logging

#### Current State: **MINIMAL** ⚠️

Only logging:
- SMS send timestamps
- Errors in Logger

#### Missing:
- Who made assignments
- Who sent group chats
- Configuration changes
- Failed login attempts (if auth added)

#### Recommendations:
```javascript
// Create audit log sheet
function logAudit(action, user, details) {
  const auditSheet = getSheet('AuditLog');
  auditSheet.appendRow([
    new Date().toISOString(),
    Session.getActiveUser().getEmail(),
    action,
    JSON.stringify(details)
  ]);
}

// Usage:
logAudit('SEND_GROUP_CHAT', user, {week: weekStartIso, recipients: numbers.length});
logAudit('SAVE_ASSIGNMENT', user, {event: eventId, staff: assignments.length});
```

**Priority:** MEDIUM
**Effort:** Low

---

## Enhancement Recommendations

### 1. Feature Enhancements

#### A. Conflict Detection
```javascript
// Check for overlapping staff assignments
function detectConflicts(assignments, weekStartIso) {
  // Check if same employee assigned to overlapping times
  // across multiple events
}
```

#### B. Availability Management
```javascript
// Track employee availability
// Prevent assigning unavailable staff
```

#### C. Shift Templates
```javascript
// Save common assignment patterns
// "Coffee Popup Template": John 9-1, Jane 1-5
```

#### D. Multi-timezone Support
```javascript
// Handle events in different timezones
// Show times in both event TZ and user TZ
```

#### E. SMS Response Handling
```javascript
// Webhook to handle replies:
// - "YES" to confirm
// - "STOP" to opt-out
// - "HELP" for info
```

### 2. UI/UX Enhancements

#### A. Drag-and-Drop Assignment
- Drag employees to events
- Visual calendar view

#### B. Mobile Responsiveness
Current CSS is basic. Needs:
- Better mobile navigation
- Touch-friendly controls
- Swipe gestures

#### C. Dark Mode
```css
@media (prefers-color-scheme: dark) {
  body { background: #1a202c; }
  .event-card { background: #2d3748; color: #fff; }
}
```

#### D. Offline Mode
- Service Worker for caching
- Queue changes when offline
- Sync when online

### 3. Performance Enhancements

#### A. Caching
```javascript
// Cache calendar events for 1 hour
const cacheKey = `events_${weekStartIso}`;
const cache = CacheService.getScriptCache();
let events = JSON.parse(cache.get(cacheKey) || 'null');

if (!events) {
  events = cal.getEvents(start, end);
  cache.put(cacheKey, JSON.stringify(events), 3600);
}
```

#### B. Batch Operations
```javascript
// Save all assignments in one API call
// Instead of individual saves
```

#### C. Lazy Loading
```javascript
// Load only current week initially
// Prefetch next/prev weeks
```

### 4. Integration Enhancements

#### A. Slack Integration
```javascript
// Post schedules to Slack channel
function postToSlack(webhook, message) {
  UrlFetchApp.fetch(webhook, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({text: message})
  });
}
```

#### B. Email Notifications
```javascript
// Send individual emails to staff
function emailStaff(employee, assignments) {
  GmailApp.sendEmail(employee.Email, 'Your Schedule', message);
}
```

#### C. Calendar Event Creation
```javascript
// Create individual calendar events for each assignment
// "John Doe - Coffee Popup" 9:00-13:00
```

#### D. Export Formats
```javascript
// Export to:
// - PDF (printable schedule)
// - CSV (import to other systems)
// - ICS (calendar import)
```

### 5. Testing Enhancements

#### A. Mock Twilio for Testing
```javascript
// Test mode that doesn't send real SMS
const TEST_MODE = PropertiesService.getScriptProperties().getProperty('TEST_MODE') === 'true';

if (TEST_MODE) {
  Logger.log(`[TEST] Would send to ${toNumber}: ${body.substring(0, 50)}...`);
  return;
}
```

#### B. Automated Integration Tests
```javascript
// Test complete workflows
function testCompleteWorkflow() {
  // 1. Load bootstrap
  // 2. Fetch week
  // 3. Save assignment
  // 4. Send group chat (test mode)
}
```

---

## Prioritized Action Plan

### Phase 1: Critical Security (Week 1)
1. ✅ Fix XFrame mode (DENY or SAME_ORIGIN)
2. ✅ Add XSS sanitization in UI
3. ✅ Implement stronger rate limiting
4. ✅ Add SMS cost protection (daily limits)

### Phase 2: Compliance (Week 2-3)
1. ⚠️ Add consent tracking sheet
2. ⚠️ Implement opt-out handling
3. ⚠️ Add data retention policy
4. ⚠️ Create privacy notice

### Phase 3: Enhancements (Week 4-6)
1. 🎯 Add audit logging
2. 🎯 Implement conflict detection
3. 🎯 Add shift templates
4. 🎯 Improve mobile UI

### Phase 4: Integrations (Week 7-8)
1. 📧 Email notifications
2. 📅 Calendar event creation
3. 💬 Slack integration
4. 📄 PDF export

---

## Risk Assessment

| Risk | Likelihood | Impact | Priority |
|------|------------|--------|----------|
| Clickjacking via iframe | Medium | High | **P0** |
| XSS injection | Low | High | **P0** |
| SMS cost abuse | Medium | High | **P0** |
| GDPR violation | High | High | **P1** |
| Unauthorized access | Medium | Medium | **P1** |
| Data breach | Low | High | **P1** |
| SMS delivery failure | Medium | Low | **P2** |
| Performance issues | Low | Low | **P3** |

---

## Conclusion

The CupsUp Scheduler is a **solid foundation** with good security practices for a micro-app. The code is clean, well-organized, and demonstrates understanding of secure credential management.

**Strengths:**
- ✅ Clean separation of concerns
- ✅ Good input validation
- ✅ Secure credential storage
- ✅ Comprehensive error handling
- ✅ Built-in testing framework

**Must Fix Before Production:**
1. XFrame mode (1 line, 5 minutes)
2. XSS sanitization (30 minutes)
3. Stronger rate limiting (1 hour)
4. Consent tracking (4 hours)

**Overall Security Grade:** **B+ (Good, with critical fixes needed)**

With the Phase 1 critical fixes, this would be **A- (Production Ready)**.

---

**Next Steps:**
1. Review this analysis
2. Prioritize fixes based on deployment timeline
3. Run comprehensive tests (see TESTING_REPORT.md)
4. Deploy to staging environment
5. User acceptance testing
6. Production deployment

