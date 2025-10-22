---

## document-type: procedure priority: 2 status: ready-to-execute date-created: 2025-10-18 estimated-time: 45-60 minutes

# 💾 PRIORITY 2: Backup Cleanup & Retention Policy

## 🎯 Objective

Analyze, document, and resolve backup redundancy (2+ backups in 24 hours noted in session state).

---

## 📊 Backup Analysis Required

### Step 1: Identify All Backups (10 min)

**On Mac** (Terminal):

```bash
# Find all backup locations
echo "=== Google Drive Backups ==="
find ~/Library/CloudStorage/GoogleDrive* -name "*backup*" -o -name "*BACKUP*" 2>/dev/null | sort

echo "=== Local Time Machine Backups ==="
tmutil listbackups | head -20

echo "=== Git Backups/Refs ==="
cd ~/Library/CloudStorage/GoogleDrive-rhymeminded@gmail.com/My\ Drive/PDKB\ \(1\)
ls -la .git/refs/heads/ 2>/dev/null

echo "=== iCloud Backups ==="
find ~/Library/Mobile\ Documents -name "*PDKB*" 2>/dev/null

echo "=== Local Duplicate Folders ==="
find ~/Downloads ~/Desktop -name "*PDKB*" -o -name "*pdkb*" 2>/dev/null

# Get backup sizes
echo -e "\n=== Backup Sizes ==="
du -sh ~/Library/CloudStorage/GoogleDrive* 2>/dev/null | grep -i backup
```

**On Windows** (PowerShell):

```powershell
$VaultPath = "C:\Users\rhyme\Documents\PDKB"

# Find backup folders
Get-ChildItem -Path $env:USERPROFILE -Recurse -Filter "*backup*" -Directory 2>/dev/null | 
    Where-Object { $_.FullName -match "PDKB|pdkb" }

# Find backup files
Get-ChildItem -Path $VaultPath -Recurse -Filter "*backup*" 2>/dev/null

# OneDrive backups
Get-ChildItem -Path "$env:USERPROFILE\OneDrive*" -Recurse -Filter "*PDKB*" 2>/dev/null

# Git refs
Get-ChildItem -Path "$VaultPath\.git\refs" -Recurse

# Duplicate folders
Get-ChildItem -Path $env:USERPROFILE\Downloads -Filter "*PDKB*" -Directory
Get-ChildItem -Path $env:USERPROFILE\Desktop -Filter "*PDKB*" -Directory

# Calculate sizes
Get-ChildItem -Path $VaultPath -Recurse | 
    Measure-Object -Property Length -Sum | 
    ForEach-Object { "$([math]::Round($_.Sum/1GB,2)) GB" }
```

---

## 📋 Create Backup Inventory

**Template** - Run and complete this:

```markdown
# Backup Inventory - [DATE]

## Identified Backups

### Location 1: [PATH]
- Size: [SIZE]
- Files: [COUNT]
- Date Modified: [DATE]
- Last Accessed: [DATE]
- Redundant?: [YES/NO]
- Action: [KEEP/DELETE/ARCHIVE]

### Location 2: [PATH]
- Size: [SIZE]
- Files: [COUNT]
- Date Modified: [DATE]
- Last Accessed: [DATE]
- Redundant?: [YES/NO]
- Action: [KEEP/DELETE/ARCHIVE]

### Location 3: [PATH]
- Size: [SIZE]
- Files: [COUNT]
- Date Modified: [DATE]
- Last Accessed: [DATE]
- Redundant?: [YES/NO]
- Action: [KEEP/DELETE/ARCHIVE]

## Summary

**Total Backup Size**: [SIZE]  
**Number of Backups**: [COUNT]  
**Redundant Copies**: [COUNT]  
**Archivable**: [SIZE]  
**Deletable**: [SIZE]  

## Recommendations

1. [RECOMMENDATION_1]
2. [RECOMMENDATION_2]
3. [RECOMMENDATION_3]
```

---

## 🗂️ Retention Policy Definition

### Recommended Policy

Create file: `0A-Vault Mngmt/BACKUP-RETENTION-POLICY.md`

````markdown
---
document-type: policy
category: backup-management
security-level: safe
created: 2025-10-18
reviewed: [DATE]
next-review: [DATE]
---

# Backup Retention Policy

## 📋 Policy Overview

**Effective Date**: 2025-10-18  
**Review Cycle**: Quarterly  
**Last Updated**: [DATE]  

---

## 🎯 Policy Objectives

1. Maintain sufficient backups for recovery without redundancy
2. Optimize storage usage and cloud sync efficiency
3. Ensure data availability across platforms (Mac, Windows)
4. Enable quick recovery from accidental deletion or corruption

---

## 📊 Backup Tiers and Retention

### Tier 1: Active Working Copy (Primary)
**Location**: Google Drive PDKB vault (live sync)  
**Retention**: Continuous (100% of current files)  
**Sync**: Mac + Windows via Google Drive  
**Update Frequency**: Real-time  
**Recovery Time**: Immediate  

### Tier 2: Version Control Backup (Git)
**Location**: `.git/` folder in vault root  
**Retention**: Last 30 commits (rolling window)  
**Size Limit**: Keep to <1 GB  
**Update Frequency**: Per major change  
**Recovery Time**: < 1 hour  
**Action on Deletion**: Git can recover up to 90 days via reflog  

**Cleanup Procedure**:
```bash
# Mac/Linux
cd ~/Library/CloudStorage/GoogleDrive-rhymeminded@gmail.com/My\ Drive/PDKB\ \(1\)
git reflog expire --expire=30.days.ago --all
git gc --aggressive --prune=now

# Windows
cd C:\Users\rhyme\Documents\PDKB
git reflog expire --expire=30.days.ago --all
git gc --aggressive --prune=now
````

### Tier 3: Time-based Backup (Monthly Snapshot)

**Location**: `95-AI-Conversations/backups/YYYY-MM-DD-FULL-BACKUP.tar.gz`  
**Retention**: Last 3 monthly backups only (90 days rolling)  
**Frequency**: 1st of each month  
**Size**: Full vault snapshot (~[SIZE] GB compressed)  
**Recovery Time**: 2-4 hours

**Creation Script**:

```bash
# Mac
tar -czf ~/Library/CloudStorage/GoogleDrive-rhymeminded@gmail.com/My\ Drive/PDKB\ \(1\)/95-AI-Conversations/backups/$(date +%Y-%m-%d)-FULL-BACKUP.tar.gz \
  ~/Library/CloudStorage/GoogleDrive-rhymeminded@gmail.com/My\ Drive/PDKB\ \(1\) \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.DS_Store'

# Windows (PowerShell)
$BackupPath = "C:\Users\rhyme\Documents\PDKB\95-AI-Conversations\backups"
$VaultPath = "C:\Users\rhyme\Documents\PDKB"
$BackupName = "$(Get-Date -Format 'yyyy-MM-dd')-FULL-BACKUP.zip"
Compress-Archive -Path $VaultPath -DestinationPath "$BackupPath\$BackupName" -Force
```

### Tier 4: Cloud Provider Backup (Google Drive)

**Location**: Google Drive revision history  
**Retention**: Google Drive's default (varies, typically 30 days for deleted files)  
**Frequency**: Continuous (automatic)  
**Recovery Time**: 1-2 hours  
**Cost**: Included with Google Drive storage

---

## 🗑️ Deletion/Cleanup Schedule

|Backup Type|Check Frequency|Max Age|Max Copies|Action|
|---|---|---|---|---|
|Git refs|Weekly|30 days|N/A (pruned)|Auto-prune|
|Monthly snapshots|Monthly|90 days|3 copies|Delete oldest|
|Time Machine|Monthly|3 months|Manual|Delete oldest|
|Duplicate folders|Monthly|7 days|1 copy|Delete duplicates|
|Temp files|Weekly|3 days|N/A|Delete|

---

## 🔄 Backup Testing & Validation

### Monthly Validation (1st Saturday of month)

- [ ] Verify Git repository integrity
- [ ] Attempt recovery from monthly backup (test file only)
- [ ] Confirm Google Drive sync status
- [ ] Check backup storage usage

**Testing Command**:

```bash
# Test Git integrity
cd /path/to/vault
git fsck --full

# Test monthly backup (extract to test location, verify 10 random files)
tar -tzf 95-AI-Conversations/backups/2025-10-01-FULL-BACKUP.tar.gz | head -20
```

---

## 💾 Current Implementation

### Before Policy Implementation

```
❌ 2+ backups in 24 hours (redundant)
❌ No clear retention policy
❌ Backup storage growing unchecked
❌ Recovery procedures undefined
❌ Backup testing: none
```

### After Policy Implementation

```
✅ Tier 1: Google Drive (live, continuous)
✅ Tier 2: Git (automatic, pruned monthly)
✅ Tier 3: Monthly snapshots (3 max)
✅ Tier 4: Cloud provider (automatic)
✅ Clear deletion schedule
✅ Monthly validation tests
✅ Documented recovery procedures
```

---

## 📝 Recovery Procedures

### Quick Recovery (< 1 hour)

**Use**: For recent accidental deletions  
**Source**: Google Drive revision history or Tier 1

```
1. Go to Google Drive
2. Right-click deleted file/folder
3. Select "Restore"
4. Confirm recovery
```

### Standard Recovery (1-4 hours)

**Use**: For point-in-time recovery  
**Source**: Git backup (Tier 2) or Monthly snapshot (Tier 3)

```bash
# From Git
cd vault
git log --oneline | head -20  # Find desired commit
git checkout COMMIT_HASH -- path/to/file

# From Monthly Backup
cd /tmp
tar -xzf ~/path/to/backup.tar.gz
# Restore desired files
cp -r backup/files/* ~/vault/
```

### Full Recovery (4+ hours)

**Use**: For complete vault restoration  
**Source**: Full monthly snapshot backup

```bash
# Create new location
mkdir ~/PDKB-Recovery

# Extract full backup
tar -xzf ~/path/to/FULL-BACKUP.tar.gz -C ~/PDKB-Recovery

# Verify integrity
ls -la ~/PDKB-Recovery/
find ~/PDKB-Recovery -type f | wc -l

# Once verified, move back to working location
rm -rf ~/path/to/working/PDKB
mv ~/PDKB-Recovery/PDKB ~/path/to/working/
```

---

## ✅ Cleanup Actions (Execute Now)

### Immediate Cleanup (10 min)

**Mac**:

```bash
# Find and remove duplicate backup folders
rm -rf ~/Downloads/*PDKB* 2>/dev/null
rm -rf ~/Desktop/*PDKB* 2>/dev/null

# Archive old Time Machine backups (if >1 year old)
tmutil listbackups | tail -10 | xargs -I {} tmutil delete {}

# Prune Git immediately
cd ~/Library/CloudStorage/GoogleDrive-rhymeminded@gmail.com/My\ Drive/PDKB\ \(1\)
git gc --aggressive --prune=now
```

**Windows**:

```powershell
# Remove duplicate folders
Remove-Item "$env:USERPROFILE\Downloads\*PDKB*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$env:USERPROFILE\Desktop\*PDKB*" -Recurse -Force -ErrorAction SilentlyContinue

# Prune Git
cd "C:\Users\rhyme\Documents\PDKB"
git gc --aggressive --prune=now

# Remove temp files older than 7 days
Get-ChildItem -Path $env:TEMP -Filter "*PDKB*" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
    Remove-Item -Force
```

### Storage Verification

**Before Cleanup**:

```bash
du -sh ~/Library/CloudStorage/GoogleDrive* 2>/dev/null | tail -1
# Example: 45.2 GB
```

**After Cleanup** (run 5 min later):

```bash
du -sh ~/Library/CloudStorage/GoogleDrive* 2>/dev/null | tail -1
# Example: 32.1 GB (13.1 GB freed)
```

---

## 📋 Implementation Checklist

### Week 1: Analysis & Planning

- [ ] Run backup inventory scripts
- [ ] Identify all backup locations
- [ ] Complete backup inventory document
- [ ] Document findings in session log

### Week 2: Policy Definition

- [ ] Create `BACKUP-RETENTION-POLICY.md`
- [ ] Define retention tiers
- [ ] Document cleanup schedule
- [ ] Plan testing procedures

### Week 3: Implementation

- [ ] Execute immediate cleanup
- [ ] Verify storage reduction
- [ ] Create backup testing schedule
- [ ] Document recovery procedures

### Week 4: Ongoing

- [ ] Monthly validation tests
- [ ] Quarterly policy review
- [ ] Adjust retention as needed
- [ ] Document all changes

---

## 📊 Expected Results

**Backup Storage Reduction**: 30-50% (estimated 10-20 GB freed)  
**Redundancy**: Eliminated  
**Maintenance**: Automated monthly  
**Recovery Capability**: Maintained/improved  
**Policy Review**: Quarterly

---

**STATUS**: Ready to execute  
**NEXT**: After completion, move to PRIORITY 3 (Script Validation)