# Deployment Guide - CupsUp Scheduler

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Google Sheets Setup](#google-sheets-setup)
3. [Google Apps Script Deployment](#google-apps-script-deployment)
4. [Twilio Configuration](#twilio-configuration)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts
- [ ] Google Account with Google Workspace or personal Gmail
- [ ] Twilio Account (free trial or paid)
- [ ] Access to Google Calendar

### Required Information
- [ ] Google Calendar ID
- [ ] Twilio Account SID
- [ ] Twilio Auth Token
- [ ] Twilio Phone Number (SMS-enabled)
- [ ] Employee phone numbers (E.164 format)

## Google Sheets Setup

### Step 1: Create New Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click "Blank" to create new spreadsheet
3. Name it "CupsUp Scheduler"

### Step 2: Create Settings Sheet

1. Rename "Sheet1" to "Settings"
2. In cell A1, type "Key"
3. In cell B1, type "Value"
4. Add the following rows:

| A (Key) | B (Value) |
|---------|-----------|
| CALENDAR_ID | your-calendar@group.calendar.google.com |
| TIMEZONE | America/New_York |
| TWILIO_FROM | +15551234567 |
| GROUP_CHAT_NUMBERS | +15559876543,+15551112222 |

**Important Notes:**
- Get your Calendar ID: Open Google Calendar → Settings → Your calendar → "Calendar ID"
- TIMEZONE: Use [IANA timezone names](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
- TWILIO_FROM: Your Twilio phone number in +1XXXXXXXXXX format
- GROUP_CHAT_NUMBERS: Comma-separated list of recipient phone numbers

### Step 3: Create Employees Sheet

1. Click "+" to add new sheet
2. Name it "Employees"
3. Add headers in row 1:

| A (Name) | B (Phone) | C (Role) | D (Notes) |
|----------|-----------|----------|-----------|
| John Doe | +15551234567 | Barista | Morning shift |
| Jane Smith | +15559876543 | Manager | Team lead |

**Phone Format:** Must be +1XXXXXXXXXX (E.164 format)

### Step 4: Create Assignments Sheet

1. Click "+" to add new sheet
2. Name it "Assignments"
3. Add headers in row 1:

| WeekStart | EventId | Title | Date | Start | End | City | State | Assigned | SentLog |
|-----------|---------|-------|------|-------|-----|------|-------|----------|---------|

Leave row 2+ empty - system will populate automatically.

## Google Apps Script Deployment

### Step 1: Open Script Editor

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code in `Code.gs`

### Step 2: Add Code Files

1. **Code.gs:**
   - Copy entire contents from `src/Code.gs`
   - Paste into the script editor
   - Save (Ctrl+S or Cmd+S)

2. **ui.html:**
   - Click "+" next to "Files"
   - Select "HTML"
   - Name it "ui" (exactly, no extension)
   - Copy entire contents from `src/ui.html`
   - Paste and save

### Step 3: Configure Script Properties

1. In Apps Script editor, click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Click **Add script property**
4. Add these two properties:

| Property | Value |
|----------|-------|
| TWILIO_SID | Your Twilio Account SID (starts with AC...) |
| TWILIO_AUTH | Your Twilio Auth Token |

**Security Note:** Never put these in the Settings sheet - Script Properties are encrypted.

### Step 4: Set Project Name

1. Click "Untitled project" at top
2. Name it "CupsUp Scheduler"
3. Save

## Twilio Configuration

### Step 1: Get Twilio Credentials

1. Log in to [twilio.com/console](https://www.twilio.com/console)
2. Find your **Account SID** (starts with "AC...")
3. Find your **Auth Token** (click to reveal)
4. Copy both to Script Properties (see above)

### Step 2: Get Twilio Phone Number

1. Go to **Phone Numbers > Manage > Active numbers**
2. If you don't have one, click **Buy a number**
3. Select a number with SMS capability
4. Copy the number in E.164 format (+1XXXXXXXXXX)
5. Add to Settings sheet as `TWILIO_FROM`

### Step 3: Configure Messaging

1. Click your Twilio phone number
2. Under "Messaging", configure:
   - Geo Permissions: Ensure US is enabled
   - Alpha Sender: Leave default
3. Save configuration

## Testing

### Step 1: Run Test Suite

1. Refresh your Google Sheet
2. You should see a new menu: **🧪 CupsUp Tests**
3. Click **RUN ALL TESTS**
4. Review the results in the popup

Expected output:
```
✅ Passed: 7
❌ Failed: 0
⚠️  Warnings: 0
```

### Step 2: Individual Tests

Run each test individually to diagnose issues:

1. **Test Settings Load** - Validates Settings sheet
2. **Test Employee Load** - Validates Employees sheet
3. **Test Calendar Access** - Checks calendar permissions
4. **Test Twilio Credentials** - Validates Twilio setup
5. **Test Fetch This Week** - Loads current week's events
6. **Test Group Chat Numbers** - Validates recipient numbers

### Step 3: Send Test Message

**IMPORTANT:** Before running this test:

1. Update `GROUP_CHAT_NUMBERS` in Settings to **YOUR PHONE NUMBER ONLY**
2. Click **🧪 CupsUp Tests > Send TEST Message**
3. Confirm the popup
4. Check your phone within 60 seconds

If you receive the message, Twilio is working correctly!

## Production Deployment

### Step 1: Deploy Web App

1. In Apps Script editor, click **Deploy > New deployment**
2. Click gear icon, select **Web app**
3. Configure settings:
   - **Description:** "CupsUp Scheduler v1.0"
   - **Execute as:** Me (your email)
   - **Who has access:** Select appropriate option:
     - "Only myself" - Most secure, only you can access
     - "Anyone with Google account" - Anyone logged into Google
     - "Anyone" - Public access (not recommended)
4. Click **Deploy**
5. Copy the **Web app URL**
6. Click **Done**

### Step 2: Test Web Interface

1. Open the Web app URL in a browser
2. You should see the CupsUp Scheduler interface
3. Try selecting a week
4. Verify events load from calendar

### Step 3: Configure Recipients

1. In Settings sheet, update `GROUP_CHAT_NUMBERS`
2. Add all recipient phone numbers, comma-separated
3. Example: `+15551234567,+15559876543,+15551112222`
4. Verify format using **Test Group Chat Numbers**

### Step 4: First Production Send

1. Assign employees to events for the current week
2. Double-check all assignments
3. Click **Send Group Chat**
4. Confirm the action
5. Verify all recipients receive the message

## Troubleshooting

### Calendar Not Loading

**Error:** "Cannot access calendar"

**Solutions:**
1. Verify Calendar ID is correct in Settings
2. Share calendar with your Google account:
   - Open Google Calendar
   - Find the calendar
   - Click "..." → Settings and sharing
   - Under "Share with specific people", add your email
   - Set permission to "Make changes to events"

### Twilio Not Sending

**Error:** "Twilio error 401" or "Twilio error 403"

**Solutions:**
1. Verify TWILIO_SID and TWILIO_AUTH in Script Properties
2. Check Twilio account status (suspended/trial limitations)
3. Verify account balance (for paid accounts)
4. Check Twilio phone number is active

**Error:** "Twilio error 21211" (Invalid phone number)

**Solutions:**
1. Ensure all phone numbers are in +1XXXXXXXXXX format
2. No spaces, dashes, or parentheses
3. Run **Test Group Chat Numbers** to validate

### Assignments Not Saving

**Error:** "Assignments sheet not found"

**Solutions:**
1. Verify sheet is named exactly "Assignments" (case-sensitive)
2. Check sheet hasn't been deleted
3. Refresh the page

### Script Timeout

**Error:** "Exceeded maximum execution time"

**Solutions:**
1. Reduce number of events per week
2. Send to fewer recipients at once
3. Consider upgrading to Google Workspace for higher quotas

### Authorization Required

**Error:** "Authorization is required"

**Solutions:**
1. Re-authorize the script:
   - Extensions > Apps Script
   - Run any function manually
   - Click "Review permissions"
   - Select your account
   - Click "Advanced" → "Go to CupsUp Scheduler (unsafe)"
   - Click "Allow"

## Post-Deployment Checklist

- [ ] All tests pass
- [ ] Test message received successfully
- [ ] Web app URL is accessible
- [ ] Calendar events load correctly
- [ ] Employees can be assigned
- [ ] Group chat sends successfully
- [ ] All recipients received message
- [ ] Script Properties are secured
- [ ] Appropriate access controls set

## Maintenance

### Weekly Checklist
- [ ] Review employee roster
- [ ] Verify calendar events for upcoming week
- [ ] Test before sending group chat
- [ ] Monitor Twilio usage/balance

### Monthly Checklist
- [ ] Review Twilio logs for errors
- [ ] Update employee contact information
- [ ] Verify calendar sharing permissions
- [ ] Check Google Apps Script quotas

## Support

For issues:
1. Run **RUN ALL TESTS** from menu
2. Check Apps Script execution logs (View > Logs)
3. Review Twilio logs in console
4. Verify all prerequisites met

## Security Best Practices

1. **Never commit credentials:**
   - Keep TWILIO_SID and TWILIO_AUTH in Script Properties only
   - Don't share Script Properties screenshots

2. **Limit access:**
   - Use "Only myself" for web app when possible
   - Review who has access to Google Sheet

3. **Test before bulk sends:**
   - Always use "Send TEST Message" first
   - Start with small recipient lists

4. **Monitor usage:**
   - Check Twilio usage regularly
   - Set up billing alerts

5. **Backup data:**
   - Download copy of Google Sheet regularly
   - Export code via clasp or manual copy

---

**Deployment Complete!** 🎉

Your CupsUp Scheduler is now live and ready to use.
