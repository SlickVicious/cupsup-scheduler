# 🚀 Deploy CupsUp Scheduler to Google Sheets

**Complete step-by-step guide to get your scheduler running in Google Sheets**

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Google Account
- [ ] Access to Google Sheets
- [ ] Access to Google Calendar
- [ ] Twilio Account (free trial works)
  - Account SID
  - Auth Token
  - Phone Number (SMS-enabled)
- [ ] Node.js installed (for clasp CLI)
- [ ] Terminal access

---

## 🎯 Quick Start (Choose Your Method)

### Method 1: Manual Setup (Recommended for First Time)
**Time:** 20 minutes
**Best for:** Understanding the system
**→ See Section A below**

### Method 2: Automated Setup with Clasp
**Time:** 10 minutes
**Best for:** Quick deployment
**Requires:** clasp CLI installed
**→ See Section B below**

---

## 📦 Section A: Manual Setup (Step-by-Step)

### Step 1: Create Google Sheet (5 minutes)

1. **Go to:** https://sheets.google.com
2. **Click:** "Blank" to create new spreadsheet
3. **Rename:** "CupsUp Scheduler"

### Step 2: Create Sheet Tabs (2 minutes)

Create three sheets with these EXACT names:

#### Sheet 1: Settings
1. Right-click "Sheet1" → Rename → "Settings"
2. Add headers in Row 1:
   - A1: `Key`
   - B1: `Value`
3. Add these rows (starting Row 2):

| A (Key) | B (Value) |
|---------|-----------|
| CALENDAR_ID | your-calendar-id@group.calendar.google.com |
| TIMEZONE | America/New_York |
| TWILIO_FROM | +15551234567 |
| GROUP_CHAT_NUMBERS | +15551234567 |

**Important Notes:**
- **CALENDAR_ID:** Get from Google Calendar → Settings → Your Calendar → Calendar ID
- **TIMEZONE:** Use IANA format (America/New_York, America/Los_Angeles, etc.)
- **TWILIO_FROM:** Your Twilio phone number in +1XXXXXXXXXX format
- **GROUP_CHAT_NUMBERS:** For testing, use YOUR phone number ONLY (comma-separated for multiple)

#### Sheet 2: Employees
1. Click "+" at bottom → Add sheet → Rename to "Employees"
2. Add headers in Row 1:
   - A1: `Name`
   - B1: `Phone`
   - C1: `Role`
   - D1: `Notes`
3. Add test employees (starting Row 2):

| Name | Phone | Role | Notes |
|------|-------|------|-------|
| Test Employee 1 | +15551234567 | Barista | Test user |
| Test Employee 2 | +15559876543 | Manager | Test user |

**Important:** Phone numbers MUST be in +1XXXXXXXXXX format

#### Sheet 3: Assignments
1. Click "+" → Add sheet → Rename to "Assignments"
2. Add headers in Row 1:
   - A1: `WeekStart`
   - B1: `EventId`
   - C1: `EventTitle`
   - D1: `Date`
   - E1: `Start`
   - F1: `End`
   - G1: `City`
   - H1: `State`
   - I1: `Assigned`
   - J1: `SMSStatus`
3. Leave rows 2+ empty (system will populate)

### Step 3: Deploy Apps Script (8 minutes)

1. **In your Google Sheet, click:** Extensions → Apps Script

2. **Delete default code** in Code.gs

3. **Copy Code.gs content:**
   - Open: `/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/Code.gs`
   - Select all and copy

4. **Paste into Apps Script editor**

5. **Save:** Ctrl+S (Cmd+S on Mac)

6. **Create UI file:**
   - Click "+" next to Files
   - Select "HTML"
   - Name it: `ui` (exactly, no extension)

7. **Copy ui.html content:**
   - Open: `/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/ui.html`
   - Select all and copy

8. **Paste into ui HTML file**

9. **Save:** Ctrl+S (Cmd+S on Mac)

10. **Name your project:**
    - Click "Untitled project"
    - Name it: "CupsUp Scheduler"
    - Save

### Step 4: Configure Script Properties (3 minutes)

**CRITICAL:** Never put Twilio credentials in the Settings sheet!

1. **In Apps Script editor, click:** ⚙️ Project Settings (gear icon)

2. **Scroll to:** "Script Properties" section

3. **Click:** "Add script property"

4. **Add Property 1:**
   - Property: `TWILIO_SID`
   - Value: Your Twilio Account SID (starts with "AC...")
   - Click "Add script property"

5. **Add Property 2:**
   - Property: `TWILIO_AUTH`
   - Value: Your Twilio Auth Token
   - Click "Add script property"

**Where to find these:**
- Log in to: https://www.twilio.com/console
- Account SID and Auth Token are on the dashboard

### Step 5: Deploy Web App (2 minutes)

1. **In Apps Script editor, click:** Deploy → New deployment

2. **Click:** Gear icon ⚙️ → Select type: "Web app"

3. **Configure:**
   - Description: "CupsUp Scheduler v1.0"
   - Execute as: "Me (your-email@gmail.com)"
   - Who has access: "Only myself" (for testing)

4. **Click:** Deploy

5. **Click:** Authorize access
   - Select your Google account
   - Click "Advanced"
   - Click "Go to CupsUp Scheduler (unsafe)"
   - Click "Allow"

6. **Copy the Web App URL** (you'll need this!)

7. **Click:** Done

### Step 6: Test the System (5 minutes)

#### Test 1: Refresh Your Google Sheet
1. **Close and reopen** your Google Sheet
2. **You should see:** New menu "🧪 CupsUp Tests" appear at top
3. **If you don't see it:** Wait 10 seconds and refresh again

#### Test 2: Run Settings Test
1. **Click:** 🧪 CupsUp Tests → 1️⃣ Test Settings Load
2. **You should see:** Green checkmark showing all settings loaded
3. **If failed:** Check Settings sheet values

#### Test 3: Run Employee Test
1. **Click:** 🧪 CupsUp Tests → 2️⃣ Test Employee Load
2. **Should show:** Your test employees
3. **If failed:** Check Employees sheet format

#### Test 4: Test Calendar Access
1. **First, share your calendar:**
   - Open Google Calendar
   - Click your calendar → Settings and sharing
   - Under "Share with specific people", add your email
   - Permission: "Make changes to events"
   - Click "Send"

2. **Run test:**
   - Click: 🧪 CupsUp Tests → 3️⃣ Test Calendar Access
   - Should show: Calendar name and timezone

#### Test 5: Test Twilio Credentials
1. **Click:** 🧪 CupsUp Tests → 4️⃣ Test Twilio Credentials
2. **Should show:** All credentials found
3. **If failed:** Check Script Properties

#### Test 6: Send Test Message
⚠️ **CRITICAL:** Only do this if GROUP_CHAT_NUMBERS is YOUR phone number!

1. **Verify:** Settings sheet has YOUR number in GROUP_CHAT_NUMBERS
2. **Click:** 🧪 CupsUp Tests → 📱 Send TEST Message
3. **Confirm:** Click "Yes"
4. **Check your phone:** Should receive test SMS within 60 seconds
5. **If received:** ✅ Twilio is working!

### Step 7: Test the Web Interface

1. **Open the Web App URL** you copied in Step 5

2. **You should see:**
   - Header: "☕ CupsUp Scheduler"
   - Week picker
   - "Fetch Week" button
   - "Send to Group Chat" button

3. **Click:** "📅 Fetch Week"
   - Should load events from your calendar
   - If no events: Add test event to calendar first

4. **Test assigning staff:**
   - Click "+ Add Staff" on an event
   - Select an employee
   - Set start/end times
   - Click "💾 Save Assignments"
   - Should see: "✅ Assignments saved!"

5. **Test on mobile:**
   - Open Web App URL on your phone
   - Should be fully responsive

---

## 📦 Section B: Automated Setup with Clasp

### Prerequisites

Install clasp globally
```bash
npm install -g @google/clasp
```

Login to Google
```bash
clasp login
```

### Step 1: Clone This Project

Navigate to project directory
```bash
cd "/Users/animatedastronaut/VAULTS/CupSup Scheduler"
```

Create new Apps Script project
```bash
clasp create --type sheets --title "CupsUp Scheduler"
```

This will:
- Create new Google Sheet
- Create Apps Script project
- Generate `.clasp.json` with script ID

### Step 2: Update .clasp.json

The file should look like:
```json
{
  "scriptId": "YOUR_SCRIPT_ID_HERE",
  "rootDir": "./src"
}
```

### Step 3: Push Code

Push Code.gs and ui.html to Apps Script
```bash
clasp push
```

Open the script in browser
```bash
clasp open
```

### Step 4: Continue with Manual Steps

After clasp push, continue with:
- **Section A, Step 2:** Create sheet tabs (Settings, Employees, Assignments)
- **Section A, Step 4:** Configure Script Properties (Twilio credentials)
- **Section A, Step 5:** Deploy Web App
- **Section A, Step 6:** Test the system

---

## 🔧 Troubleshooting

### "Settings sheet not found"
**Fix:** Ensure sheet is named exactly "Settings" (case-sensitive)

### "Cannot access calendar"
**Fix:**
1. Share calendar with your Google account
2. Use correct Calendar ID in Settings sheet
3. Run calendar test from custom menu

### "Twilio credentials not configured"
**Fix:**
1. Check Script Properties (not Settings sheet!)
2. Verify TWILIO_SID and TWILIO_AUTH are set
3. Run Twilio credentials test

### "Invalid phone number format"
**Fix:** All phone numbers must be +1XXXXXXXXXX format
- ✅ Correct: +15551234567
- ❌ Wrong: (555) 123-4567, 555-123-4567, 15551234567

### "Authorization required" when opening Web App
**Fix:**
1. Click "Advanced"
2. Click "Go to CupsUp Scheduler (unsafe)"
3. Click "Allow"
4. This is normal for unverified apps

### Custom menu doesn't appear
**Fix:**
1. Close and reopen Google Sheet
2. Wait 10 seconds
3. Refresh page
4. Check Apps Script editor for errors

### "Exceeded maximum execution time"
**Fix:**
1. Reduce number of calendar events
2. Limit date range
3. Check for infinite loops in code

---

## 📊 Testing Checklist

After deployment, verify each:

### Core Functionality
- [ ] Custom menu appears in Google Sheet
- [ ] All test functions run successfully
- [ ] Web app URL opens correctly
- [ ] Week picker shows current Monday
- [ ] Fetch Week loads calendar events
- [ ] Can assign staff to events
- [ ] Can save assignments
- [ ] Assignments persist after reload

### Security Features
- [ ] XSS protection active (view page source, no raw HTML)
- [ ] Rate limiting works (try sending twice in 60 seconds)
- [ ] Daily limit enforced (try sending 11 times in one day)
- [ ] Recipient limit works (try 51 recipients)
- [ ] Message size limit enforced (create long message)

### SMS Functionality
- [ ] Test message received on your phone
- [ ] Message format correct (emojis, formatting)
- [ ] Can reply STOP (Twilio handles this)
- [ ] Cost estimate shown in logs

### Mobile Experience
- [ ] Responsive design works
- [ ] All buttons clickable
- [ ] Forms usable
- [ ] No horizontal scrolling

---

## 📁 File Locations

All files are in: `/Users/animatedastronaut/VAULTS/CupSup Scheduler/`

**Source code:**
```
src/
├── Code.gs         ← Copy to Apps Script
└── ui.html         ← Copy to Apps Script as "ui"
```

**Documentation:**
```
README.md                  ← Project overview
DEPLOYMENT.md             ← Detailed setup guide
DEPLOYMENT_READY.md       ← Production readiness
SECURITY_ANALYSIS.md      ← Security review
TEST_REPORT.md            ← Testing documentation
```

**This guide:**
```
DEPLOY_TO_SHEETS.md       ← You are here!
```

---

## 🎯 Quick Reference Commands

### Get Calendar ID
1. Open Google Calendar
2. Click your calendar → Settings
3. Scroll to "Integrate calendar"
4. Copy "Calendar ID"

### Get Twilio Credentials
1. Go to: https://www.twilio.com/console
2. Account SID: Shown on dashboard
3. Auth Token: Click "Show" to reveal
4. Phone Number: Go to Phone Numbers → Active Numbers

### Open Apps Script Editor
In Google Sheet:
```
Extensions → Apps Script
```

### View Execution Logs
In Apps Script editor:
```
View → Logs (Ctrl+Enter)
```

### View Script Properties
In Apps Script editor:
```
⚙️ Project Settings → Script Properties
```

---

## 🚀 Next Steps After Successful Deployment

### 1. Add Real Calendar Events
- Create events in Google Calendar
- Include location (City, State format)
- Set start/end times

### 2. Add Real Employees
- Update Employees sheet with actual staff
- Use real phone numbers (in +1XXXXXXXXXX format)
- Add roles and notes

### 3. Test Full Workflow
- Fetch a week with events
- Assign real employees
- Save assignments
- **IMPORTANT:** Set GROUP_CHAT_NUMBERS to YOUR number only
- Send test group chat
- Verify you receive SMS

### 4. Production Rollout
- Update GROUP_CHAT_NUMBERS with all recipient numbers
- Change web app access from "Only myself" to appropriate level
- Monitor for 1 week
- Full rollout

---

## 💡 Pro Tips

### Tip 1: Start Small
Begin with 1-2 test employees and 1-2 calendar events

### Tip 2: Test Thoroughly
Always send test messages to YOURSELF first, never to real users during testing

### Tip 3: Monitor Costs
Check Twilio dashboard daily during first week to understand usage patterns

### Tip 4: Keep Backups
Google Sheets automatically versions, but export a backup before major changes

### Tip 5: Use Test Mode
Create a separate test Google Sheet for experimenting before affecting production data

---

## 📞 Support

**If you get stuck:**

1. Check the troubleshooting section above
2. Review TEST_REPORT.md for diagnostics
3. Check Apps Script execution logs
4. Review Twilio logs at twilio.com/console
5. Verify all prerequisites are met

**Common first-time issues:**
- Calendar not shared → Share it with your account
- Twilio credentials wrong → Double-check from console
- Phone number format → Must be +1XXXXXXXXXX
- Sheet names wrong → Must be exact: Settings, Employees, Assignments

---

## ✅ Success Criteria

You'll know deployment succeeded when:

- ✅ Custom menu appears automatically
- ✅ All 8 test functions pass
- ✅ Test SMS received on your phone
- ✅ Web app loads and functions
- ✅ Can assign and save staff
- ✅ Group chat sends successfully

**Estimated setup time:** 20-30 minutes
**Once working:** 2-3 minutes per week to schedule

---

**Ready to deploy? Start with Section A, Step 1!** 🚀

*Last updated: October 22, 2025*
*Version: 1.0.0 (Security Hardened)*
