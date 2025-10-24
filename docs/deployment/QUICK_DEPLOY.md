# ⚡ Quick Deploy to Your Google Sheet

**Your Sheet:** https://docs.google.com/spreadsheets/d/1DhCgKeH3b9MX0Aa4U9u70Kg63ayae710h0B_s0LsaK4/edit

---

## 🎯 Step-by-Step Deployment (15 minutes)

### Step 1: Prepare Your Sheet (3 minutes)

**Create 3 sheets with EXACT names:**

1. **Settings** (rename Sheet1)
2. **Employees** (add new sheet)
3. **Assignments** (add new sheet)

### Step 2: Populate Settings Sheet

In the "Settings" sheet, add:

**Row 1 (Headers):**
- A1: `Key`
- B1: `Value`

**Rows 2-5 (Data):**

| A | B |
|---|---|
| CALENDAR_ID | your-calendar-id@group.calendar.google.com |
| TIMEZONE | America/New_York |
| TWILIO_FROM | +15551234567 |
| GROUP_CHAT_NUMBERS | +15551234567 |

**⚠️ IMPORTANT:**
- Replace `your-calendar-id@group.calendar.google.com` with your actual Calendar ID
- Replace `+15551234567` with YOUR phone number (for testing)
- Use exact +1XXXXXXXXXX format

**Get Calendar ID:**
1. Open Google Calendar
2. Click your calendar → Settings
3. Find "Calendar ID" under "Integrate calendar"

### Step 3: Populate Employees Sheet

In the "Employees" sheet:

**Row 1 (Headers):**
- A1: `Name`
- B1: `Phone`
- C1: `Role`
- D1: `Notes`

**Rows 2-3 (Test Data):**

| Name | Phone | Role | Notes |
|------|-------|------|-------|
| Test User 1 | +15551234567 | Barista | Test employee |
| Test User 2 | +15559876543 | Manager | Test employee |

Replace with YOUR phone numbers for testing!

### Step 4: Populate Assignments Sheet

In the "Assignments" sheet:

**Row 1 (Headers only):**
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

**Leave rows 2+ empty** (system fills automatically)

---

## 📝 Step 5: Deploy Apps Script (5 minutes)

### 5A: Open Apps Script

1. In your Google Sheet, click: **Extensions → Apps Script**
2. You'll see a new tab with Code.gs

### 5B: Copy Code.gs

**From Terminal/Finder:**

Option 1: Open in default editor
```bash
open "/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/Code.gs"
```

Option 2: Print to terminal (then copy)
```bash
cat "/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/Code.gs"
```

**Or manually:**
1. Navigate to: `/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/`
2. Open `Code.gs` in your text editor
3. Select All (Cmd+A)
4. Copy (Cmd+C)

**In Apps Script Editor:**
1. Delete the default `function myFunction() {}` code
2. Paste the entire Code.gs content
3. Save (Cmd+S)

### 5C: Create ui.html File

**In Apps Script Editor:**
1. Click the **"+"** next to "Files"
2. Select **"HTML"**
3. Name it: **`ui`** (exactly, no .html extension)
4. Click "OK"

**Copy ui.html content:**

Open in editor
```bash
open "/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/ui.html"
```

Or print to terminal
```bash
cat "/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/ui.html"
```

**In the ui file:**
1. Delete default content
2. Paste entire ui.html content
3. Save (Cmd+S)

### 5D: Name Your Project

1. Click "Untitled project" at the top
2. Name it: **"CupsUp Scheduler"**
3. Click "Rename"

---

## 🔐 Step 6: Add Twilio Credentials (2 minutes)

**⚠️ CRITICAL: Never put these in the Settings sheet!**

1. In Apps Script editor, click **⚙️ Project Settings** (gear icon on left)

2. Scroll to **"Script Properties"**

3. Click **"Add script property"**

4. Add First Property:
   - Property: `TWILIO_SID`
   - Value: `Your Twilio Account SID` (starts with AC...)

5. Click **"Add script property"** again

6. Add Second Property:
   - Property: `TWILIO_AUTH`
   - Value: `Your Twilio Auth Token`

7. Click **"Save script properties"**

**Get Twilio Credentials:**
1. Go to: https://www.twilio.com/console
2. Find Account SID and Auth Token on dashboard
3. Click "Show" to reveal Auth Token

---

## 🚀 Step 7: Deploy Web App (3 minutes)

1. In Apps Script editor, click **Deploy → New deployment**

2. Click the **⚙️ gear icon** next to "Select type"

3. Select **"Web app"**

4. Configure:
   - **Description:** "CupsUp Scheduler v1.0"
   - **Execute as:** "Me (your-email)"
   - **Who has access:** "Only myself"

5. Click **"Deploy"**

6. Click **"Authorize access"**
   - Select your Google account
   - Click **"Advanced"**
   - Click **"Go to CupsUp Scheduler (unsafe)"** (this is normal!)
   - Click **"Allow"**

7. **Copy the Web App URL** - You'll need this!

8. Click **"Done"**

---

## ✅ Step 8: Test Everything (5 minutes)

### Test 1: Custom Menu

1. **Go back to your Google Sheet**
2. **Refresh the page** (Cmd+R or F5)
3. **Wait 10 seconds**
4. **Look for** "🧪 CupsUp Tests" menu at the top
5. **If you don't see it:** Wait another 10 seconds and refresh again

### Test 2: Run Test Suite

**Click:** 🧪 CupsUp Tests → **1️⃣ Test Settings Load**
- Should show green checkmark with your settings

**Click:** 🧪 CupsUp Tests → **2️⃣ Test Employee Load**
- Should show your test employees

**Click:** 🧪 CupsUp Tests → **4️⃣ Test Twilio Credentials**
- Should show credentials found

### Test 3: Calendar Setup

**First, share your calendar:**
1. Open Google Calendar
2. Click your calendar → **Settings and sharing**
3. Scroll to "Share with specific people"
4. Click **"+ Add people"**
5. Add your email address
6. Permission: **"Make changes to events"**
7. Click **"Send"**

**Then test:**
**Click:** 🧪 CupsUp Tests → **3️⃣ Test Calendar Access**
- Should show calendar name

### Test 4: Send Test SMS

**⚠️ ONLY if GROUP_CHAT_NUMBERS is YOUR phone number!**

1. Verify Settings sheet has YOUR number in GROUP_CHAT_NUMBERS
2. **Click:** 🧪 CupsUp Tests → **📱 Send TEST Message**
3. **Confirm:** Click "Yes"
4. **Check your phone:** SMS should arrive in 30-60 seconds

### Test 5: Web Interface

1. **Open the Web App URL** you copied in Step 7
2. **Click:** "📅 Fetch Week"
3. **Should show:** Any calendar events for this week (or empty state if none)

---

## 🎯 Quick Reference

### Your Sheet URL
```
https://docs.google.com/spreadsheets/d/1DhCgKeH3b9MX0Aa4U9u70Kg63ayae710h0B_s0LsaK4/edit
```

### File Locations (Your Mac)
```
Code.gs:
/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/Code.gs

ui.html:
/Users/animatedastronaut/VAULTS/CupSup Scheduler/src/ui.html
```

### Open Files in Terminal

Navigate to project
```bash
cd "/Users/animatedastronaut/VAULTS/CupSup Scheduler"
```

Open Code.gs
```bash
open src/Code.gs
```

Open ui.html
```bash
open src/ui.html
```

Or use cat to print to terminal
```bash
cat src/Code.gs
```

```bash
cat src/ui.html
```

---

## 🔧 Troubleshooting

### "Custom menu doesn't appear"
**Solution:**
1. Refresh the sheet (Cmd+R)
2. Wait 10-15 seconds
3. Close and reopen the sheet
4. Check Apps Script editor for errors (red text)

### "Settings sheet not found"
**Solution:** Sheet must be named exactly **"Settings"** (capital S, case-sensitive)

### "Cannot access calendar"
**Solution:**
1. Share calendar with your email
2. Use correct Calendar ID in Settings sheet
3. Wait a few minutes after sharing

### "Authorization required"
**Solution:** This is normal. Click:
1. "Advanced"
2. "Go to CupsUp Scheduler (unsafe)"
3. "Allow"

---

## ✨ Next Steps After Successful Deployment

1. **Add real calendar events** in Google Calendar
2. **Update Employees sheet** with real staff
3. **Test assigning staff** using the web interface
4. **Send test group chat** (to YOUR number only!)
5. **Review for 1 week** before production use

---

## 📞 Need Help?

**Check these files for detailed info:**
- `DEPLOY_TO_SHEETS.md` - Complete deployment guide
- `TEST_REPORT.md` - Testing documentation
- `SECURITY_ANALYSIS.md` - Security features
- `DEPLOYMENT.md` - Full setup instructions

**Common issues solved in DEPLOY_TO_SHEETS.md troubleshooting section!**

---

**Estimated Time:** 15-20 minutes total
**Difficulty:** Beginner-friendly
**Result:** Fully functional scheduler ready to test! 🚀

---

*Last updated: October 22, 2025*
*For Google Sheet: 1DhCgKeH3b9MX0Aa4U9u70Kg63ayae710h0B_s0LsaK4*
