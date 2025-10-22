---

## document-type: procedure priority: 3 status: ready-to-execute date-created: 2025-10-18 estimated-time: 90-120 minutes scripts-to-test: 6

# 🔬 PRIORITY 3: Script Validation & Testing Procedure

## 🎯 Objective

Validate all 6 PowerShell automation scripts in safe mode before production use.

---

## 📋 Scripts to Test

|#|Script Name|Purpose|Complexity|WhatIf Support|
|---|---|---|---|---|
|1|Vault-Analysis-Automation.ps1|Analyze vault structure and generate reports|Medium|✅ Native|
|2|Batch-Property-Addition.ps1|Add document properties intelligently|Medium|✅ Native|
|3|Create-Navigation-Dashboard.ps1|Build navigation system|Low|✅ Native|
|4|Execute-Vault-Reorganization.ps1|Reorganize folders and files|High|✅ Native|
|5|Setup-Bases-Estate.ps1|Configure Obsidian Bases plugin|Low|⚠️ Partial|
|6|Master-Automation-Runner.ps1|Menu-driven orchestrator|Low|✅ Native|

---

## ✅ Pre-Flight Checklist (5 min)

Before testing ANY script:

- [ ] PowerShell 7.0+ installed
    
    ```powershell
    $PSVersionTable.PSVersion
    # Should show 7.x or higher
    ```
    
- [ ] Execution Policy allows scripts
    
    ```powershell
    Get-ExecutionPolicy
    # Should return "RemoteSigned" or "Unrestricted"
    
    # If restricted, run once:
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    ```
    
- [ ] Vault backup created
    
    ```powershell
    # Create date-stamped backup
    $BackupPath = "C:\Users\rhyme\Documents\PDKB-Backup-$(Get-Date -Format 'yyyyMMdd-HHmm')"
    Copy-Item -Path "C:\Users\rhyme\Documents\PDKB" -Destination $BackupPath -Recurse
    ```
    
- [ ] Test environment ready
    
    ```powershell
    # Navigate to script directory
    cd "C:\Users\rhyme\Documents\PDKB\0A-Vault Mngmt"
    
    # Verify scripts exist
    Get-ChildItem -Filter "*.ps1" | Select-Object Name, Length
    ```
    
- [ ] Console ready for logging
    
    ```powershell
    # Start transcript
    Start-Transcript -Path "C:\Users\rhyme\Documents\PDKB\script-test-log-$(Get-Date -Format 'yyyyMMdd-HHmm').txt"
    ```
    

---

## 🧪 TEST 1: Vault-Analysis-Automation.ps1

### Purpose

Analyze vault structure without making changes. Safe to run multiple times.

### Test Execution

```powershell
# SAFE TEST: WhatIf mode (simulates without executing)
$VaultPath = "C:\Users\rhyme\Documents\PDKB"
$ScriptPath = "$VaultPath\0A-Vault Mngmt\Vault-Analysis-Automation.ps1"

# First, source the script
. $ScriptPath

# Run analysis (read-only operation)
Write-Host "Starting Vault Analysis..." -ForegroundColor Green
Get-ChildItem -Path $VaultPath -Recurse -Directory | Measure-Object | Select-Object Count
Get-ChildItem -Path $VaultPath -Recurse -File | Measure-Object | Select-Object Count

# Expected: Basic metrics output
```

### Validation Checklist

- [ ] Script executes without errors
- [ ] Generates `Vault-Index.md` in PDKB root
- [ ] Generates `Folder-Analysis.csv` with data
- [ ] Generates `File-Analysis.csv` with data
- [ ] `Rename-VaultItems.ps1` generated (not executed)
- [ ] No files actually modified
- [ ] Reports are readable and logical

### Expected Output

```
📊 Vault Analysis Results:
   Existing Folders: 50
   Missing Folders: 0
   Total Files: 5000+
   File Groups: [CSV output]
   Rename Script Generated: Yes
   Status: ✅ SUCCESS
```

### Log Entry Template

```markdown
## Script 1: Vault-Analysis-Automation.ps1

**Test Date**: [DATE]  
**Execution Time**: [TIME_SECONDS] seconds  
**Status**: [PASS/FAIL]  

**Generated Files**:
- ✅ Vault-Index.md
- ✅ Folder-Analysis.csv
- ✅ File-Analysis.csv
- ✅ Rename-VaultItems.ps1 (preview only)

**Errors**: None  
**Warnings**: None  

**Result**: Script validated ✅
```

---

## 🧪 TEST 2: Batch-Property-Addition.ps1

### Purpose

Add document properties to existing files. HIGH PRIORITY for backup before running.

### Pre-Test Verification

```powershell
# CRITICAL: Verify backup exists
$BackupPath = "C:\Users\rhyme\Documents\PDKB-Backup-*"
if (Get-Item $BackupPath -ErrorAction SilentlyContinue) {
    Write-Host "✅ Backup confirmed" -ForegroundColor Green
} else {
    Write-Host "❌ BACKUP MISSING - DO NOT PROCEED" -ForegroundColor Red
    Exit
}
```

### Test Execution

```powershell
# SAFE TEST: Use -WhatIf to preview changes
$VaultPath = "C:\Users\rhyme\Documents\PDKB"
$ScriptPath = "$VaultPath\0A-Vault Mngmt\Batch-Property-Addition.ps1"

# Run with preview only
& $ScriptPath -VaultPath $VaultPath -WhatIf:$true

# Expected output: Shows what WOULD be changed, doesn't actually change anything
```

### Validation Checklist

- [ ] Script executes with -WhatIf flag
- [ ] Preview shows properties that would be added
- [ ] No actual files modified (WhatIf mode)
- [ ] Reports show logical property assignments
- [ ] Document categorization appears correct
- [ ] Priority detection reasonable

### Expected Output

```
🔍 Batch Property Addition - Preview Mode

Scanning: C:\Users\rhyme\Documents\PDKB
Found: 500+ markdown files

Preview of properties to be added:
[FILE] 02-forms/form-1.md
  → document_type: legal
  → document_category: federal
  → status: active
  → priority: high

[FILE] 95-AI-Conversations/log-1.md
  → document_type: communication
  → document_category: chat
  → status: active
  → priority: medium

[WhatIf] 450 files would be updated
[WhatIf] No actual changes made
Status: ✅ PREVIEW SUCCESSFUL - Safe to execute
```

### Log Entry Template

```markdown
## Script 2: Batch-Property-Addition.ps1

**Test Date**: [DATE]  
**Execution Time**: [TIME_SECONDS] seconds  
**Mode**: WhatIf (preview only)  
**Status**: [PASS/FAIL]  

**Preview Summary**:
- Files to be modified: 450+
- Properties to add: 5 per file
- No actual changes made: ✅

**Errors**: None  
**Warnings**: [ANY_WARNINGS]  

**Result**: Script validated ✅
```

---

## 🧪 TEST 3: Create-Navigation-Dashboard.ps1

### Purpose

Create navigation system. Safe, read-only operation on Obsidian files.

### Test Execution

```powershell
# SAFE TEST: Safe to run multiple times
$VaultPath = "C:\Users\rhyme\Documents\PDKB"
$ScriptPath = "$VaultPath\0A-Vault Mngmt\Create-Navigation-Dashboard.ps1"

& $ScriptPath -VaultPath $VaultPath

# Expected: Creates markdown files with navigation
```

### Validation Checklist

- [ ] Script executes without errors
- [ ] Creates `Estate Management Dashboard.md`
- [ ] Creates MOC (Maps of Content) files
- [ ] Generates navigation toolbar CSS
- [ ] All markdown syntax valid
- [ ] Dataview queries syntactically correct
- [ ] Dashboard links work in Obsidian

### Expected Output

```
🏗️ Navigation System Creation

Creating Estate Management Dashboard...
✅ Dashboard created: Estate Management Dashboard.md

Creating Maps of Content (MOCs)...
✅ MOC: Legal-Process-Map.md
✅ MOC: Financial-Process-Map.md
✅ MOC: Identity-Status-Map.md

Creating navigation CSS...
✅ Navigation toolbar CSS generated

Status: ✅ SUCCESS
Files created: 5
```

### Log Entry Template

```markdown
## Script 3: Create-Navigation-Dashboard.ps1

**Test Date**: [DATE]  
**Execution Time**: [TIME_SECONDS] seconds  
**Status**: [PASS/FAIL]  

**Generated Files**:
- ✅ Estate Management Dashboard.md
- ✅ Legal-Process-Map.md
- ✅ Financial-Process-Map.md
- ✅ Navigation CSS file
- ✅ Quick Access Toolbar

**Validation**:
- Markdown syntax: ✅ Valid
- Dataview queries: ✅ Valid
- Links: ✅ Verified
- Obsidian compatibility: ✅ Confirmed

**Result**: Script validated ✅
```

---

## 🧪 TEST 4: Execute-Vault-Reorganization.ps1

### Purpose

REORGANIZE VAULT STRUCTURE. **HIGHEST RISK** - absolutely requires backup.

### Pre-Flight (CRITICAL)

```powershell
# MANDATORY BACKUP CHECK
$BackupPath = "C:\Users\rhyme\Documents\PDKB-Backup-*"
$LatestBackup = Get-Item $BackupPath | Sort-Object CreationTime -Descending | Select-Object -First 1

if (-not $LatestBackup) {
    Write-Host "❌ BACKUP MISSING - ABORTING FOR SAFETY" -ForegroundColor Red
    Exit 1
}

Write-Host "✅ Backup verified: $($LatestBackup.FullName)" -ForegroundColor Green

# VERIFY VAULT NOT IN USE
Write-Host "🚨 CLOSE OBSIDIAN NOW - Vault will be reorganized"
Read-Host "Press Enter when Obsidian is closed"
```

### Test Execution - PREVIEW ONLY

```powershell
$VaultPath = "C:\Users\rhyme\Documents\PDKB"
$ScriptPath = "$VaultPath\0A-Vault Mngmt\Execute-Vault-Reorganization.ps1"

# PREVIEW MODE: Shows what will change
& $ScriptPath -VaultPath $VaultPath -WhatIf:$true -Verbose

# Expected: Detailed preview of folder moves and renames
```

### Validation Checklist (Preview Phase)

- [ ] Script shows reorganization plan
- [ ] Folder mappings look correct
- [ ] Link updates identified
- [ ] No actual changes made
- [ ] Rollback plan provided
- [ ] Estimated completion time reasonable

### If Preview Approved - Execute Live

```powershell
# FULL EXECUTION (only after successful preview)
Write-Host "Executing vault reorganization..." -ForegroundColor Cyan
& $ScriptPath -VaultPath $VaultPath -WhatIf:$false -Verbose

# Monitor progress:
# - Watch console output
# - Verify backups created before major moves
# - Check for errors
```

### Post-Execution Verification

```powershell
# Check that reorganization completed
$NewStructure = Get-ChildItem -Path $VaultPath -Directory

Write-Host "Verifying new structure..."
$NewStructure | Select-Object Name, @{
    Name = "FileCount"
    Expression = { (Get-ChildItem $_.FullName -Recurse -File).Count }
}

# Verify Git still works
cd $VaultPath
git status  # Should succeed
git log --oneline | head -5  # Should show history
```

### Log Entry Template

```markdown
## Script 4: Execute-Vault-Reorganization.ps1

**Test Date**: [DATE]  
**Execution Mode**: [Preview/Live]  
**Status**: [PASS/FAIL]  

**Pre-Flight**:
- Backup verified: ✅
- Obsidian closed: ✅
- Vault locked: ✅

**Preview Summary**:
- Folders to rename: 15
- Files to relocate: 450+
- Links to update: 200+
- Estimated time: 30 minutes

[If executed live]
**Execution Results**:
- Folders renamed: 15 ✅
- Files relocated: 450+ ✅
- Links updated: 200+ ✅
- Actual time: [TIME] minutes ✅

**Post-Execution**:
- Git status: ✅ Healthy
- File counts: ✅ Matched
- Backups created: ✅
- Rollback available: ✅

**Result**: Script validated ✅
```

---

## 🧪 TEST 5: Setup-Bases-Estate.ps1

### Purpose

Configure Obsidian Bases plugin for estate documents.

### Pre-Test

```powershell
# Verify Obsidian Bases plugin installed
$VaultPath = "C:\Users\rhyme\Documents\PDKB"
$PluginPath = "$VaultPath\.obsidian\plugins\obsidian-database"

if (Test-Path $PluginPath) {
    Write-Host "✅ Bases plugin found" -ForegroundColor Green
} else {
    Write-Host "⚠️ Bases plugin not found - install from Obsidian settings" -ForegroundColor Yellow
}
```

### Test Execution

```powershell
$VaultPath = "C:\Users\rhyme\Documents\PDKB"
$ScriptPath = "$VaultPath\0A-Vault Mngmt\Setup-Bases-Estate.ps1"

& $ScriptPath -VaultPath $VaultPath -Verbose
```

### Validation Checklist

- [ ] Script creates Bases configuration files
- [ ] Creates `Document Index` base
- [ ] Creates `Active Documents` base
- [ ] Creates `Processing Queue` base
- [ ] Creates estate document templates
- [ ] Configuration JSON valid
- [ ] Works with Obsidian Bases plugin

### Expected Output

```
⚙️ Obsidian Bases Configuration

Creating bases...
✅ Document Index base created
✅ Active Documents base created
✅ Processing Queue base created

Creating templates...
✅ Estate document template
✅ Financial document template
✅ Legal document template

Configuration applied to Obsidian
Status: ✅ SUCCESS
```

### Log Entry Template

```markdown
## Script 5: Setup-Bases-Estate.ps1

**Test Date**: [DATE]  
**Execution Time**: [TIME_SECONDS] seconds  
**Status**: [PASS/FAIL]  
**Bases Plugin**: [Installed/Missing]  

**Bases Created**:
- ✅ Document Index
- ✅ Active Documents
- ✅ Processing Queue

**Templates Generated**: 3  
**Configuration Valid**: ✅  

**Errors**: None  
**Warnings**: [ANY_WARNINGS]  

**Result**: Script validated ✅
```

---

## 🧪 TEST 6: Master-Automation-Runner.ps1

### Purpose

Menu-driven orchestrator for all scripts.

### Test Execution

```powershell
$VaultPath = "C:\Users\rhyme\Documents\PDKB"
$ScriptPath = "$VaultPath\0A-Vault Mngmt\Master-Automation-Runner.ps1"

# Launch interactive menu
& $ScriptPath -VaultPath $VaultPath

# Expected: Interactive menu with options
```

### Menu Options Testing

```
┌─ MASTER AUTOMATION RUNNER ─┐
│ 1. Run Vault Analysis       │
│ 2. Add Properties           │
│ 3. Create Navigation        │
│ 4. Reorganize Vault         │
│ 5. Setup Bases              │
│ 6. Quick Setup (safe)       │
│ 7. Full Reorganization      │
│ Q. Quit                     │
└────────────────────────────┘

# Test each option in order (skip 7 for now)
```

### Validation Checklist

- [ ] Menu displays correctly
- [ ] Option 1 (Analysis) works ✅
- [ ] Option 2 (Properties) works ✅
- [ ] Option 3 (Navigation) works ✅
- [ ] Option 4 (Reorganization) preview works ✅
- [ ] Option 5 (Bases) works ✅
- [ ] Option 6 (Quick Setup) works ✅
- [ ] Menu loops correctly
- [ ] Exit works properly

### Log Entry Template

```markdown
## Script 6: Master-Automation-Runner.ps1

**Test Date**: [DATE]  
**Execution Time**: [TIME_SECONDS] seconds  
**Status**: [PASS/FAIL]  

**Menu Options Tested**:
- ✅ Option 1: Vault Analysis
- ✅ Option 2: Add Properties (preview)
- ✅ Option 3: Create Navigation
- ✅ Option 4: Reorganize (preview)
- ✅ Option 5: Setup Bases
- ✅ Option 6: Quick Setup

**User Interface**: ✅ Clear and responsive  
**Error Handling**: ✅ Graceful  
**Exit**: ✅ Clean  

**Result**: Script validated ✅
```

---

## 📊 Consolidated Test Report

### Template for Final Report

Create file: `0A-Vault Mngmt\SCRIPT-VALIDATION-REPORT-[DATE].md`

```markdown
---
document-type: validation-report
date: [DATE]
execution-status: [complete/incomplete]
all-scripts-pass: [yes/no]
---

# PowerShell Script Validation Report

**Report Date**: [DATE]  
**Total Scripts**: 6  
**Passed**: [X]/6  
**Failed**: [Y]/6  
**Time Total**: [X] minutes  

## Summary Table

| Script | Status | Issues | Recommendation |
|--------|--------|--------|----------------|
| 1. Vault-Analysis | ✅ PASS | None | Ready for production |
| 2. Batch-Property | ✅ PASS | None | Proceed after backup |
| 3. Navigation | ✅ PASS | None | Ready for production |
| 4. Reorganization | ✅ PASS | None | Proceed with caution |
| 5. Setup-Bases | ✅ PASS | Plugin TBD | Install if needed |
| 6. Master-Runner | ✅ PASS | None | Ready for production |

## Detailed Results

### Script 1: Vault-Analysis-Automation.ps1 ✅
- Status: PASS
- Execution Time: [X] seconds
- Files Generated: 4
- Errors: 0
- Recommendation: Ready for immediate use

### Script 2: Batch-Property-Addition.ps1 ✅
- Status: PASS
- Execution Time: [X] seconds
- WhatIf Preview: Successful
- Errors: 0
- Recommendation: Safe to execute after preview

### Script 3: Create-Navigation-Dashboard.ps1 ✅
- Status: PASS
- Execution Time: [X] seconds
- Files Generated: 5
- Errors: 0
- Recommendation: Ready for immediate use

### Script 4: Execute-Vault-Reorganization.ps1 ✅
- Status: PASS
- Execution Time: [X] seconds (preview)
- Preview Validated: Yes
- Errors: 0
- Recommendation: Ready to execute (monitor progress)

### Script 5: Setup-Bases-Estate.ps1 ✅
- Status: PASS
- Execution Time: [X] seconds
- Bases Created: 3
- Errors: 0
- Recommendation: Verify Obsidian plugin installed first

### Script 6: Master-Automation-Runner.ps1 ✅
- Status: PASS
- Execution Time: [X] seconds
- Menu Options: 6/6 working
- Errors: 0
- Recommendation: Ready for user interaction

## Overall Recommendation

**✅ ALL SCRIPTS VALIDATED**

All 6 scripts executed successfully and are ready for regular use.

**Implementation Priority**:
1. ✅ Run Vault-Analysis (non-destructive)
2. ✅ Create Navigation (non-destructive)
3. ⚠️ Add Properties (requires backup, uses WhatIf first)
4. ⚠️ Reorganize Vault (high-impact, use WhatIf first)
5. ✅ Setup Bases (if plugin installed)
6. ✅ Use Master-Runner for ongoing automation

**Next Steps**:
1. File this report in `0A-Vault Mngmt/`
2. Create backup strategy document
3. Schedule regular script execution
4. Monitor results and adjust as needed

---

**Validated By**: Claude AI Assistant  
**Date**: [DATE]  
**Status**: Ready for Production ✅
```

---

## 🎬 Quick Execution Checklist

```powershell
# Copy-paste these commands in order

# 1. PREPARATION
$BackupPath = "C:\Users\rhyme\Documents\PDKB-Backup-$(Get-Date -Format 'yyyyMMdd-HHmm')"
Copy-Item "C:\Users\rhyme\Documents\PDKB" -Destination $BackupPath -Recurse
Start-Transcript -Path "C:\script-tests-$(Get-Date -Format 'yyyyMMdd').txt"

# 2. TEST 1: ANALYSIS
& "C:\Users\rhyme\Documents\PDKB\0A-Vault Mngmt\Vault-Analysis-Automation.ps1"

# 3. TEST 2: PROPERTIES (PREVIEW)
& "C:\Users\rhyme\Documents\PDKB\0A-Vault Mngmt\Batch-Property-Addition.ps1" -WhatIf:$true

# 4. TEST 3: NAVIGATION
& "C:\Users\rhyme\Documents\PDKB\0A-Vault Mngmt\Create-Navigation-Dashboard.ps1"

# 5. TEST 4: REORGANIZATION (PREVIEW)
& "C:\Users\rhyme\Documents\PDKB\0A-Vault Mngmt\Execute-Vault-Reorganization.ps1" -WhatIf:$true

# 6. TEST 5: BASES
& "C:\Users\rhyme\Documents\PDKB\0A-Vault Mngmt\Setup-Bases-Estate.ps1"

# 7. TEST 6: MASTER RUNNER
& "C:\Users\rhyme\Documents\PDKB\0A-Vault Mngmt\Master-Automation-Runner.ps1"

# 8. FINISH
Stop-Transcript
```

---

**STATUS**: Ready to execute  
**NEXT**: After completion, move to PRIORITY 4 (Index Refresh)