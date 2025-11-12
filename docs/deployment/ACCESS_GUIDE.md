# CupsUp Scheduler - Access & Sharing Guide

**Last Updated:** November 11, 2025  
**Version:** 1.0.0

---

## 🔐 Access Levels Overview

| Access Level | Who Can Access | Use Case | Security |
|--------------|----------------|----------|----------|
| **Only Myself** | Just you | Development/Testing | Highest |
| **Anyone with Google Account** | Anyone you share URL with | Team access | Medium |
| **Anyone** | Public access (not recommended) | Public scheduling | Lowest |

---

## 🚀 Method 1: Quick Dev Testing (Test Deployment)

**Best for:** Personal testing, development

### Steps:

1. **Open Google Sheets** with your CupsUp data
2. **Extensions > Apps Script**
3. **In Apps Script Editor:**
   - Click **Deploy** (top right)
   - Select **Test deployments**
   - Click **Select type** → **Web app**
4. **Copy the Test URL** (looks like: `...script.google.com/.../dev`)
5. **Open in browser** - you're in!

### Characteristics:
- ✅ Always runs latest code (no need to redeploy)
- ✅ Perfect for development
- ✅ Changes take effect immediately
- ⚠️ URL changes if you switch Google accounts
- ⚠️ Only accessible to you

---

## 👥 Method 2: Share with Peers (New Deployment)

**Best for:** Team collaboration, production use

### Step 1: Create Deployment

1. **Open Google Sheets** → **Extensions > Apps Script**
2. **Click Deploy** → **New deployment**
3. **Configuration:**
   ```
   Type: Web app
   Description: CupsUp Scheduler v1.0
   
   Execute as: Me (your-email@gmail.com)
   Who has access: Anyone with Google account
   ```
4. **Click Deploy**
5. **Copy the Web App URL** - looks like:
   ```
   https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```

### Step 2: Share with Team

**Option A: Share URL Directly**
```
Hey team! Here's our CupsUp Scheduler:
https://script.google.com/macros/s/ABC123.../exec

Login with your Google account to access.
```

**Option B: Create Bookmarklet**
1. Add URL to browser bookmarks
2. Rename to "CupsUp Scheduler"
3. Share bookmark instructions with team

**Option C: Add to Google Site** (if you have one)
```html
<iframe src="YOUR_WEB_APP_URL" width="100%" height="800px"></iframe>
```

---

## 🔧 Method 3: Using clasp for Local Development

**Best for:** Advanced developers, version control

### Setup:

```bash
# Navigate to project
cd /Users/animatedastronaut/VAULTS/CupSup\ Scheduler

# Already configured! Your .clasp.json exists:
# Script ID: 1I1XOGmO03PC8GE38aQsh-EaLcIOQ-j9bo_dBeYGzTfOk74Cryvy7cpdA

# Push local changes to Apps Script
npm run push

# Open Apps Script editor
npm run open

# View logs
npm run logs
```

### Development Workflow:

1. **Edit files locally** in `src/` folder
2. **Push changes:** `npm run push`
3. **Test in browser** using test deployment URL
4. **When ready:** Create new deployment for team

---

## 📱 Mobile Access

### For Team Members:

1. **Open web app URL** on mobile browser
2. **Add to Home Screen:**
   - **iOS:** Safari → Share → Add to Home Screen
   - **Android:** Chrome → Menu → Add to Home Screen
3. **Icon appears** like native app!

### Mobile Optimization:
The UI is mobile-responsive with:
- ✅ Touch-friendly buttons (min 48px)
- ✅ Responsive layouts
- ✅ Large input fields (16px font prevents zoom)
- ✅ Swipe-friendly cards

---

## 🔑 Access Control Best Practices

### For Development Testing:
```
Execute as: Me
Who has access: Only myself
```
- Use test deployments
- Keep development separate from production

### For Team Access:
```
Execute as: Me
Who has access: Anyone with Google account
```
- Requires Google login
- Can audit who accessed
- Easy to revoke (delete deployment)

### For Public Access (Not Recommended):
```
Execute as: Me
Who has access: Anyone, even anonymous
```
- ⚠️ Anyone with URL can access
- ⚠️ No authentication required
- ⚠️ Only use if absolutely necessary

---

## 🎯 Quick Start Guide for Team Members

### First Time Setup:

1. **Get URL** from admin
2. **Open URL** in browser
3. **Sign in** with Google account
4. **Grant permissions:**
   - View/edit Google Sheets
   - Access Google Calendar
   - Send SMS via Twilio (backend only)
5. **Bookmark** for easy access

### Using the Interface:

1. **Select Week** - Use date picker
2. **Click "Fetch Week"** - Loads events from calendar
3. **Assign Staff:**
   - Click event card
   - Add employee names
   - Set individual time slots
   - Save
4. **Send Group Chat** - Sends SMS schedule to team

---

## 🛠️ Troubleshooting Access Issues

### "Authorization Required"
**Solution:** First-time users must authorize the app:
1. Click "Review Permissions"
2. Sign in with Google
3. Click "Advanced" → "Go to CupsUp Scheduler (unsafe)"
4. Click "Allow"

### "Script has been disabled"
**Solution:** Admin needs to enable:
1. Apps Script editor → Deploy
2. Check deployment is active
3. Verify "Who has access" setting

### "Cannot access Google Sheets"
**Solution:** Share the Google Sheet:
1. Open the CupsUp Google Sheet
2. Share → Add team member emails
3. Grant "Editor" access

### "Calendar not loading"
**Solution:** Share the calendar:
1. Open Google Calendar
2. Settings → Share with specific people
3. Add Apps Script service account email
4. Grant "Make changes to events" permission

### URL Not Working
**Solutions:**
1. **Test deployment expired** → Use production deployment
2. **Deployment deleted** → Create new deployment
3. **Wrong URL** → Get fresh URL from Apps Script deploy screen

---

## 📊 Deployment Management

### View Current Deployments:

1. **Apps Script editor** → **Deploy** → **Manage deployments**
2. See all active deployments:
   ```
   v1.0 - Production (for team)
   Test deployment - Development (just you)
   ```

### Update Production Deployment:

**When you've made changes:**

```bash
# Option 1: Create new deployment (recommended)
1. Deploy → New deployment
2. Description: "v1.1 - Added feature X"
3. Share new URL with team

# Option 2: Update existing deployment
1. Deploy → Manage deployments
2. Click pencil icon next to deployment
3. Select "New version"
4. Add description
5. Save
```

### Archive Old Deployment:

```bash
1. Deploy → Manage deployments
2. Click archive icon
3. Confirm
```

---

## 🔗 Quick Links for Your Team

### Deployment URLs:

**Production (Team Access):**
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**Test (Development):**
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/dev
```

**Apps Script Editor:**
```bash
# Open with:
npm run open

# Or visit:
https://script.google.com/home/projects/1I1XOGmO03PC8GE38aQsh-EaLcIOQ-j9bo_dBeYGzTfOk74Cryvy7cpdA
```

---

## 💡 Pro Tips

### For Admins:

1. **Use descriptive deployment names:**
   ```
   ✅ "CupsUp v1.0 - Production"
   ❌ "Deployment 1"
   ```

2. **Keep test & production separate:**
   - Test: "Only myself"
   - Production: "Anyone with Google account"

3. **Document access in team wiki:**
   ```markdown
   ## CupsUp Scheduler Access
   URL: [link]
   Access: Google account required
   Support: your-email@example.com
   ```

### For Developers:

1. **Use clasp for version control:**
   ```bash
   clasp pull  # Get latest from Apps Script
   # Make changes locally
   clasp push  # Upload to Apps Script
   ```

2. **Test locally before deploying:**
   - Use test deployment
   - Verify all features work
   - Then create production deployment

3. **Monitor usage:**
   ```bash
   clasp logs  # View execution logs
   ```

---

## 🆘 Support

### For Team Members:
- **Can't access?** Contact admin to verify:
  - You're added to Google Sheet
  - Calendar is shared with you
  - Deployment is active

### For Admins:
- **Issues deploying?** Check:
  - Script Properties have Twilio credentials
  - Settings sheet is configured
  - All required sheets exist
  - Run test suite: Custom Menu → "RUN ALL TESTS"

---

## 📚 Related Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) - Production checklist
- [README.md](../../README.md) - Project overview
- [API_REFERENCE.md](../API_REFERENCE.md) - API documentation

---

**Need Help?** Run the automated tests:
1. Open Google Sheets
2. Custom Menu → "🧪 CupsUp Tests"
3. Click "🚀 RUN ALL TESTS"
4. Review results

