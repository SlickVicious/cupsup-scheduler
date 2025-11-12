# CupsUp Scheduler

A Google Apps Script-based scheduling system for managing employee assignments and sending automated group chat notifications via Twilio SMS.

## ✨ Features

### Core Functionality
- **📅 Calendar Integration**: Syncs with Google Calendar to fetch events (supports multi-day events)
- **👥 Manual Assignment**: Assign employees to specific events with custom time slots per staff member
- **📍 Venue Management**: Auto-save venue locations from calendar events, searchable venue database
- **💬 Group Chat Notifications**: Send weekly schedules via Twilio SMS to multiple recipients
- **👨‍💼 Employee Management**: Track employee information with validated phone numbers and roles
- **🔍 Automated Testing**: Built-in test suite to validate configuration and connectivity
- **🎨 Custom UI**: Mobile-responsive web interface for easy schedule management

### Security & Protection
- **🔒 XSS Protection**: Full HTML sanitization on all dynamic content
- **🛡️ XFrame Protection**: Clickjacking prevention (DENY mode)
- **📱 Phone Validation**: Strict E.164 format validation (+1XXXXXXXXXX)
- **⏱️ Rate Limiting**: 60-second cooldown + daily send limits (configurable)
- **💰 Cost Protection**: Message size limits, recipient limits, cost estimation
- **✅ Data Validation**: Comprehensive input validation, duplicate detection, overlap checking

### User Experience
- **🗓️ Multi-Day Event Support**: Handle events spanning multiple days
- **⏰ Individual Time Slots**: Assign different start/end times per staff member
- **🗺️ Google Maps Integration**: Automatic map links for all event locations
- **📊 Detailed Reporting**: SMS status tracking, audit logs, error handling
- **🧪 Diagnostic Tools**: Custom menu with individual test functions

## 📁 Project Structure

```
CupSup Scheduler/
├── src/
│   ├── Code.gs                              # Main application (1,474 lines)
│   ├── DiagnosesEmployees.gs               # Diagnostic utilities
│   ├── ui.html                              # Web interface with XSS protection
│   └── appsscript.json                      # Apps Script configuration
├── docs/
│   ├── COMPREHENSIVE_AUDIT_REPORT.md        # Complete security & code audit (42 issues analyzed)
│   ├── API_REFERENCE.md                     # Complete API documentation
│   ├── TEST_REPORT.md                       # Testing documentation
│   ├── security/
│   │   └── SECURITY_ANALYSIS.md             # Security review & recommendations
│   ├── deployment/
│   │   ├── DEPLOYMENT.md                    # Step-by-step deployment guide
│   │   ├── DEPLOYMENT_READY.md              # Production readiness checklist
│   │   ├── QUICK_DEPLOY.md                  # Quick start guide
│   │   └── DEPLOY_TO_SHEETS.md              # Google Sheets setup
│   └── development/
│       ├── CLAUDE_CODE_CHEATSHEET.md        # Quick reference for daily use
│       ├── OptDevWorkflow.md                # Optimized development workflow
│       ├── claude-code-optimization.md      # 93% token reduction guide
│       └── claude-code-cupsup-workflow.md   # Project-specific workflows
├── archived/
│   └── Cusp-Up-Scheduler-old-version.gs    # Previous version (reference)
├── .clasp.json                              # Google Apps Script CLI configuration
├── package.json                             # NPM package metadata
├── .gitignore                               # Git ignore rules
└── README.md                                # This file
```

## 🎯 Current Status

**Version:** 1.0.0 (Security Hardened)
**Status:** ✅ Production Ready
**Security Grade:** A- (9/10)
**Last Updated:** November 2025

### Recent Enhancements
- ✅ Phase 2 audit improvements (validation & UX)
- ✅ Critical XSS vulnerabilities fixed
- ✅ Individual time slots per staff member
- ✅ Multi-day event support
- ✅ Venue auto-save from calendar
- ✅ Comprehensive validation & error handling
- ✅ Duplicate phone number detection
- ✅ Assignment overlap prevention

## 🚀 Claude Code Optimization

This repository includes revolutionary Claude Code documentation that enables **93% token reduction** and **unlimited development** without ever using `/compact`.

### Quick Start with Sub-Agents

The magic phrase to append to EVERY command:
```bash
[your task] use a sub agent. Tell the sub agent not to report back, but to just do the job
```

Example - Build entire project in 5 minutes:
```bash
create complete CupsUp Scheduler repository use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Key Benefits

- **93% token reduction** - Build entire project using <1,000 tokens instead of 15,000+
- **Never use /compact again** - Maintain context throughout entire development
- **1000+ tasks possible** - Instead of just 8-10 with traditional approach
- **10x faster development** - No context rebuilding needed

### Essential Reading

1. **[Claude Code Optimization Guide](docs/claude-code-optimization.md)** - Complete methodology (5 min read)
2. **[CupsUp Workflow Guide](docs/claude-code-cupsup-workflow.md)** - Copy-paste commands for every task
3. **[Quick Reference Cheatsheet](CLAUDE_CODE_CHEATSHEET.md)** - Keep this visible while coding!

---

## Prerequisites

- Google Account with access to Google Sheets and Google Calendar
- Twilio Account with:
  - Account SID
  - Auth Token
  - Twilio Phone Number (SMS-enabled)

## Setup Instructions

### 1. Create Google Sheets Structure

Create a new Google Sheet with four sheets:

#### Settings Sheet
| Key | Value |
|-----|-------|
| CALENDAR_ID | your-calendar-id@group.calendar.google.com |
| TIMEZONE | America/New_York |
| TWILIO_FROM | +15551234567 |
| GROUP_CHAT_NUMBERS | +15559876543,+15551112222 |

#### Employees Sheet
| Name | Phone | Role | Notes |
|------|-------|------|-------|
| John Doe | +15551234567 | Barista | Morning shift |
| Jane Smith | +15559876543 | Manager | Team lead |

#### Assignments Sheet
| WeekStart | EventId | Title | Date | Start | End | City | State | Assigned | SMSStatus | FullAddress | Notes |
|-----------|---------|-------|------|-------|-----|------|-------|----------|-----------|-------------|-------|
| (Auto-populated by the system) |

#### Venues Sheet
| Venue Name | Full Address | City | State | Notes |
|------------|--------------|------|-------|-------|
| (Auto-populated from calendar or manually added) |

> **Note:** The Venues sheet will be automatically created if it doesn't exist. Venues are auto-saved when events are fetched from the calendar.

### 2. Configure Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Delete any existing code in `Code.gs`
4. Copy the contents of `src/Code.gs` into the editor
5. Create a new HTML file named `ui` and paste contents from `src/ui.html`
6. Save the project with a name like "CupsUp Scheduler"

### 3. Set Script Properties

1. In Apps Script editor, click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Add the following properties:
   - `TWILIO_SID`: Your Twilio Account SID
   - `TWILIO_AUTH`: Your Twilio Auth Token

### 4. Deploy Web App

1. In Apps Script editor, click **Deploy > New deployment**
2. Select type: **Web app**
3. Configure:
   - Description: "CupsUp Scheduler v1.0"
   - Execute as: "Me"
   - Who has access: "Anyone with Google account" (or more restrictive)
4. Click **Deploy**
5. Copy the web app URL

## Usage

### Opening the Interface

1. Method 1: Click the deployment URL
2. Method 2: Run `doGet()` function in Apps Script editor

### Assigning Employees

1. Select a week using the week picker
2. Events from Google Calendar will load automatically
3. For each event:
   - Click "Assign Staff"
   - Select employees and their time slots
   - Save assignments

### Sending Group Chat

1. Ensure all events for the week are assigned
2. Click "Send Group Chat" button
3. Confirm the action
4. System sends formatted schedule to all numbers in `GROUP_CHAT_NUMBERS`

### Venue Management

The application automatically manages venue locations:

1. **Auto-Save**: When fetching events, venues with locations are automatically saved
2. **Lookup**: Existing venues are matched to events by name
3. **Manual Entry**: Use the Venues sheet to add or edit venue information
4. **Bulk Import**: Run "Bulk Import Historical Venues" from the custom menu (one-time setup)
5. **Duplicate Removal**: Clean up duplicate venues using "Remove Duplicate Venues"

### Running Tests

Use the custom menu **🧪 CupsUp Tests** in Google Sheets:

- **1️⃣ Test Settings Load**: Verify all settings are configured
- **2️⃣ Test Employee Load**: Check employee data and phone formats
- **3️⃣ Test Calendar Access**: Confirm calendar permissions
- **4️⃣ Test Fetch This Week**: Load current week's events
- **5️⃣ Debug Assignments**: Check assignment data and date matching
- **🚀 RUN ALL TESTS**: Execute complete automated test suite
- **🔧 Fix Employee Phone Numbers**: Auto-format phone numbers to +1XXXXXXXXXX
- **📍 Bulk Import Historical Venues**: One-time import of venue locations (6 months history)
- **🧹 Remove Duplicate Venues**: Clean up duplicate venue entries

## Phone Number Format

All phone numbers must be in E.164 format:
```
+1XXXXXXXXXX
```

Example: `+15551234567`

## 📱 Message Format

Group chat messages are formatted as:

```
CUPSUP SCHEDULE: Jan 1-7

Monday
Coffee Popup 9:00am-5:00pm
📍 New York, NY
https://maps.google.com/?q=New%20York%2C%20NY
John Doe
Jane Smith

Tuesday
Festival Booth
📍 Brooklyn, NY
https://maps.google.com/?q=Brooklyn%2C%20NY
📝 Setup required at 8am
John Doe

```

### Message Features:
- **Compact Date Range**: "Jan 1-7" or "Oct 30-Nov 5" for cross-month weeks
- **12-Hour Time Format**: "9:00am-5:00pm" for better readability
- **Google Maps Links**: Clickable location links for navigation
- **Event Notes**: Optional notes displayed with 📝 emoji
- **Individual Staff Times**: Each person listed separately (times shown when different from event hours)
- **Multi-Day Events**: All-day events show without time ranges

## Development

### Local Development with clasp

Install clasp
```bash
npm install -g @google/clasp
```

Login to Google
```bash
clasp login
```

Clone this project
```bash
clasp clone <SCRIPT_ID>
```

Push changes
```bash
clasp push
```

Pull changes
```bash
clasp pull
```

## Troubleshooting

### Calendar Not Loading
- Verify `CALENDAR_ID` in Settings sheet
- Check calendar sharing permissions
- Run "Test Calendar Access" from menu

### SMS Not Sending
- Verify Twilio credentials in Script Properties
- Check Twilio account balance
- Ensure phone numbers are in +1XXXXXXXXXX format
- Run "Test Twilio Credentials" from menu

### Assignments Not Saving
- Check Assignments sheet exists
- Verify sheet permissions
- Review Apps Script execution logs

## Security Notes

- **Never commit** Twilio credentials to version control
- Use Google Apps Script **Script Properties** for sensitive data
- Restrict web app access appropriately
- Review phone numbers before bulk sending
- Test with your number first using "Send TEST Message"

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Review test results using "RUN ALL TESTS" menu
- Check Apps Script execution logs
- Verify all prerequisites are met

## 📊 Version History

### v1.0.0 (November 2025) - Security Hardened
**Status:** ✅ Production Ready | **Security Grade:** A- (9/10)

#### Core Features
- ✅ Manual assignment system with individual time slots
- ✅ Multi-day event support
- ✅ Group chat via Twilio SMS
- ✅ Automated testing suite with 7+ individual tests
- ✅ Custom menu interface with diagnostic tools
- ✅ Venue management (auto-save, lookup, bulk import)

#### Security Enhancements
- ✅ XSS protection with HTML sanitization
- ✅ XFrame protection (DENY mode)
- ✅ Phone number validation (+1XXXXXXXXXX format)
- ✅ Duplicate phone detection
- ✅ Rate limiting (60s cooldown + daily limits)
- ✅ Cost protection (recipient limits, message size limits)

#### Validation & Error Handling
- ✅ Comprehensive input validation (time format, date format, string lengths)
- ✅ Assignment overlap detection
- ✅ Employee existence verification
- ✅ Event time boundary validation
- ✅ Detailed error messages with actionable fixes

#### User Experience
- ✅ Mobile-responsive UI
- ✅ Google Maps integration for all locations
- ✅ 12-hour time format in messages
- ✅ Event notes support
- ✅ Venue database with search
- ✅ Utility functions (phone formatter, duplicate remover)

#### Documentation
- ✅ Comprehensive audit report (42 issues analyzed)
- ✅ Security analysis with recommendations
- ✅ Complete API reference
- ✅ Deployment readiness checklist
- ✅ Claude Code optimization guides
