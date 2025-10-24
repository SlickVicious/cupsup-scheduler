# CupsUp Scheduler

A Google Apps Script-based scheduling system for managing employee assignments and sending automated group chat notifications via Twilio SMS.

## Features

- **Calendar Integration**: Syncs with Google Calendar to fetch events
- **Manual Assignment**: Assign employees to specific events and time slots
- **Group Chat Notifications**: Send weekly schedules via Twilio SMS to multiple recipients
- **Employee Management**: Track employee information including phone numbers and roles
- **Automated Testing**: Built-in test suite to validate configuration and connectivity
- **Custom UI**: Web-based interface for easy schedule management

## Project Structure

```
CupSup Scheduler/
├── src/
│   ├── Code.gs                         # Main Google Apps Script code
│   └── ui.html                         # User interface HTML
├── docs/
│   ├── claude-code-optimization.md     # 93% token reduction guide
│   ├── claude-code-cupsup-workflow.md  # Project-specific workflows
│   └── API_REFERENCE.md                # Complete API documentation
├── CLAUDE_CODE_CHEATSHEET.md          # Quick reference for daily use
├── README.md                           # This file
├── DEPLOYMENT.md                       # Step-by-step deployment guide
├── LICENSE                             # MIT License
├── .gitignore                         # Git ignore rules
├── .clasp.json                        # Google Apps Script CLI configuration
├── package.json                        # NPM package metadata
└── complete-setup.sh                  # Setup automation script
```

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

Create a new Google Sheet with three sheets:

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
| WeekStart | EventId | Title | Date | Start | End | City | State | Assigned | SentLog |
|-----------|---------|-------|------|-------|-----|------|-------|----------|---------|
| (Auto-populated by the system) |

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

### Running Tests

Use the custom menu **🧪 CupsUp Tests** in Google Sheets:

- **Test Settings Load**: Verify all settings are configured
- **Test Employee Load**: Check employee data and phone formats
- **Test Calendar Access**: Confirm calendar permissions
- **Test Twilio Credentials**: Validate Twilio configuration
- **Test Fetch This Week**: Load current week's events
- **Test Group Chat Numbers**: Verify recipient phone numbers
- **RUN ALL TESTS**: Execute complete test suite
- **Send TEST Message**: Send test SMS (set to your number only!)

## Phone Number Format

All phone numbers must be in E.164 format:
```
+1XXXXXXXXXX
```

Example: `+15551234567`

## Message Format

Group chat messages are formatted as:

```
☕ CUPSUP SCHEDULE - Jan 1 to Jan 7

📅 Mon Jan 1
  09:00-17:00 Coffee Popup
  📍 New York, NY
  👥 John Doe (09:00-13:00), Jane Smith (13:00-17:00)

📅 Tue Jan 2
  10:00-18:00 Festival Booth
  📍 Brooklyn, NY
  👥 John Doe (10:00-18:00)

Reply STOP to unsubscribe
```

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

## Version History

### v1.0.0
- Initial release
- Manual assignment system
- Group chat via Twilio
- Automated testing suite
- Custom menu interface
