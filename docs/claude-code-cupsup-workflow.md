# CupsUp Scheduler: Claude Code Workflow Guide

Complete guide for building and maintaining CupsUp Scheduler using Claude Code's sub-agent methodology.

## Quick Start

Every command in this guide follows the pattern:
```bash
[task description] use a sub agent. Tell the sub agent not to report back, but to just do the job
```

## Table of Contents

1. [Initial Project Setup](#initial-project-setup)
2. [Core Development](#core-development)
3. [Testing & Quality](#testing--quality)
4. [Documentation](#documentation)
5. [Deployment](#deployment)
6. [Maintenance & Updates](#maintenance--updates)
7. [Advanced Workflows](#advanced-workflows)

## Initial Project Setup

### Complete Project Creation (< 300 tokens)

```bash
# Single command to build everything
create complete CupsUp Scheduler repository with all source files, documentation, and configuration use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Step-by-Step Setup (if preferred)

```bash
# 1. Repository structure
create CupsUp Scheduler repository structure with src, docs, and config directories use a sub agent. Tell the sub agent not to report back, but to just do the job

# 2. Core files
create Code.gs with calendar integration, employee management, and Twilio SMS use a sub agent. Tell the sub agent not to report back, but to just do the job

# 3. User interface
create ui.html with week selector, event display, and staff assignment interface use a sub agent. Tell the sub agent not to report back, but to just do the job

# 4. Configuration
create package.json, .gitignore, and .clasp.json configuration files use a sub agent. Tell the sub agent not to report back, but to just do the job

# 5. Documentation
create README.md and DEPLOYMENT.md with comprehensive setup instructions use a sub agent. Tell the sub agent not to report back, but to just do the job

# Total tokens: ~250-300 vs 15,000+ traditional
```

## Core Development

### Adding Features

```bash
# Email notifications
add email notification system for schedule confirmations use a sub agent. Tell the sub agent not to report back, but to just do the job

# CSV export
implement CSV export for weekly schedules use a sub agent. Tell the sub agent not to report back, but to just do the job

# Advanced scheduling
add recurring event support with custom patterns use a sub agent. Tell the sub agent not to report back, but to just do the job

# Employee availability
implement employee availability tracking and conflict detection use a sub agent. Tell the sub agent not to report back, but to just do the job

# Analytics dashboard
create analytics dashboard showing assignment statistics use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Refactoring

```bash
# Code organization
refactor Code.gs into modular functions with better separation of concerns use a sub agent. Tell the sub agent not to report back, but to just do the job

# Performance optimization
optimize calendar fetching and caching for faster load times use a sub agent. Tell the sub agent not to report back, but to just do the job

# Error handling
add comprehensive error handling with user-friendly messages use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Bug Fixes

```bash
# Fix specific issue
debug and fix timezone conversion issue in event scheduling use a sub agent. Tell the sub agent not to report back, but to just do the job

# Fix phone number validation
fix phone number validation to support international formats use a sub agent. Tell the sub agent not to report back, but to just do the job

# Fix UI issues
fix responsive design issues on mobile devices use a sub agent. Tell the sub agent not to report back, but to just do the job
```

## Testing & Quality

### Test Suite Creation

```bash
# Complete test suite
create comprehensive test suite with runAutomatedTests function and custom menu use a sub agent. Tell the sub agent not to report back, but to just do the job

# Individual test functions
implement individual test functions for settings, employees, calendar, and Twilio use a sub agent. Tell the sub agent not to report back, but to just do the job

# Integration tests
add integration tests for complete scheduling workflow use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Running Tests

```bash
# Execute all tests
run complete automated test suite and generate report use a sub agent. Tell the sub agent not to report back, but to just do the job

# Test specific component
test Twilio SMS functionality with sample messages use a sub agent. Tell the sub agent not to report back, but to just do the job

# Validate configuration
validate all settings and credentials are properly configured use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Code Quality

```bash
# Add comments
add comprehensive inline comments explaining complex logic use a sub agent. Tell the sub agent not to report back, but to just do the job

# Code review
review code for best practices and security issues use a sub agent. Tell the sub agent not to report back, but to just do the job

# Performance audit
audit code for performance bottlenecks and optimization opportunities use a sub agent. Tell the sub agent not to report back, but to just do the job
```

## Documentation

### Creating Documentation

```bash
# API documentation
create API reference documentation for all public functions use a sub agent. Tell the sub agent not to report back, but to just do the job

# Setup guide
create detailed setup guide with screenshots and step-by-step instructions use a sub agent. Tell the sub agent not to report back, but to just do the job

# Troubleshooting guide
create troubleshooting guide for common issues use a sub agent. Tell the sub agent not to report back, but to just do the job

# User manual
create end-user manual with tutorials and examples use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Updating Documentation

```bash
# Update README
update README.md with new features and updated installation steps use a sub agent. Tell the sub agent not to report back, but to just do the job

# Update deployment guide
update DEPLOYMENT.md with new Twilio configuration steps use a sub agent. Tell the sub agent not to report back, but to just do the job

# Add changelog
create CHANGELOG.md documenting all version changes use a sub agent. Tell the sub agent not to report back, but to just do the job
```

## Deployment

### Google Apps Script Deployment

```bash
# Prepare for deployment
prepare Code.gs and ui.html for Google Apps Script deployment use a sub agent. Tell the sub agent not to report back, but to just do the job

# Create deployment script
create deployment script with clasp configuration use a sub agent. Tell the sub agent not to report back, but to just do the job

# Generate deployment checklist
create deployment checklist with all required configuration steps use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Environment Setup

```bash
# Production configuration
create production environment configuration with security best practices use a sub agent. Tell the sub agent not to report back, but to just do the job

# Staging environment
set up staging environment for testing before production use a sub agent. Tell the sub agent not to report back, but to just do the job

# Backup procedures
implement automated backup procedures for Google Sheets data use a sub agent. Tell the sub agent not to report back, but to just do the job
```

## Maintenance & Updates

### Regular Maintenance

```bash
# Update dependencies
check and update all dependencies to latest versions use a sub agent. Tell the sub agent not to report back, but to just do the job

# Security audit
perform security audit and fix vulnerabilities use a sub agent. Tell the sub agent not to report back, but to just do the job

# Clean up code
remove deprecated functions and unused code use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Feature Enhancements

```bash
# Improve UI
enhance UI with better visual design and user experience use a sub agent. Tell the sub agent not to report back, but to just do the job

# Add automation
implement automatic schedule generation based on employee availability use a sub agent. Tell the sub agent not to report back, but to just do the job

# Mobile app
create mobile-responsive PWA version of the interface use a sub agent. Tell the sub agent not to report back, but to just do the job
```

## Advanced Workflows

### Multi-Feature Development

```bash
# Batch feature addition (can do 10+ features at once!)
implement the following features: 1) employee time off tracking 2) automatic conflict resolution 3) shift swap requests 4) schedule templates 5) multi-timezone support use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Complete Overhaul

```bash
# Major version upgrade
upgrade CupsUp Scheduler to v2.0 with TypeScript, modern UI framework, and microservices architecture use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### Integration Projects

```bash
# Slack integration
add Slack integration for posting schedules to channels use a sub agent. Tell the sub agent not to report back, but to just do the job

# Google Workspace integration
integrate with Google Workspace for SSO and directory sync use a sub agent. Tell the sub agent not to report back, but to just do the job

# Zapier webhooks
implement Zapier webhooks for external integrations use a sub agent. Tell the sub agent not to report back, but to just do the job
```

## Real-World Scenarios

### Scenario 1: New Developer Onboarding

```bash
# Day 1: Get complete project
clone CupsUp Scheduler repository and set up local development environment use a sub agent. Tell the sub agent not to report back, but to just do the job

# Learn codebase
generate architecture documentation and code walkthrough use a sub agent. Tell the sub agent not to report back, but to just do the job

# First contribution
implement welcome email feature for new employees use a sub agent. Tell the sub agent not to report back, but to just do the job

# Total time: 2 hours vs 2 days traditional
```

### Scenario 2: Emergency Bug Fix

```bash
# Identify issue
analyze error logs and identify root cause of SMS failures use a sub agent. Tell the sub agent not to report back, but to just do the job

# Fix bug
fix Twilio rate limiting issue with retry logic use a sub agent. Tell the sub agent not to report back, but to just do the job

# Test fix
test SMS sending with edge cases and error scenarios use a sub agent. Tell the sub agent not to report back, but to just do the job

# Deploy
create hotfix deployment package and update documentation use a sub agent. Tell the sub agent not to report back, but to just do the job

# Total time: 30 minutes vs 3 hours traditional
```

### Scenario 3: Client Customization

```bash
# Custom branding
customize UI with client branding colors and logo use a sub agent. Tell the sub agent not to report back, but to just do the job

# Custom features
add client-specific features: overtime tracking and labor cost calculation use a sub agent. Tell the sub agent not to report back, but to just do the job

# Custom reports
create custom reports for client's specific KPIs use a sub agent. Tell the sub agent not to report back, but to just do the job

# Deliver
package customized version with client documentation use a sub agent. Tell the sub agent not to report back, but to just do the job

# Total time: 4 hours vs 2 days traditional
```

## Token Usage Examples

### Traditional Workflow (16,000+ tokens)

```
> create Code.gs file
[... 2000 tokens of detailed code explanation ...]

> create ui.html
[... 1800 tokens of HTML/CSS/JS walkthrough ...]

> add Twilio integration
[... 1500 tokens of implementation details ...]

> create test suite
[... 1600 tokens of test code and explanations ...]

> write documentation
[... 1200 tokens of generated docs and summary ...]

[... 8 more similar tasks ...]

> /compact  # LOST ALL CONTEXT!
> continue with next features...
[... repeat context loss every 10 tasks ...]
```

### Sub-Agent Workflow (< 1,000 tokens)

```
> create complete CupsUp Scheduler with all files use a sub agent. Tell the sub agent not to report back, but to just do the job
[Done - 300 tokens]

> add 5 additional features: email, CSV export, analytics, templates, mobile UI use a sub agent. Tell the sub agent not to report back, but to just do the job
[Done - 250 tokens]

> create comprehensive test suite and documentation use a sub agent. Tell the sub agent not to report back, but to just do the job
[Done - 200 tokens]

> implement CI/CD and deployment automation use a sub agent. Tell the sub agent not to report back, but to just do the job
[Done - 150 tokens]

[... can continue for 100+ more tasks without /compact ...]
```

## Best Practices for CupsUp

### 1. Group Related Changes

```bash
✅ GOOD:
update employee management with validation, search, and sorting use a sub agent. Tell the sub agent not to report back, but to just do the job

❌ AVOID:
> add employee validation use a sub agent...
> add employee search use a sub agent...
> add employee sorting use a sub agent...
```

### 2. Be Specific About Scope

```bash
✅ GOOD:
add phone number validation supporting US and international E.164 format use a sub agent. Tell the sub agent not to report back, but to just do the job

❌ VAGUE:
improve phone validation use a sub agent. Tell the sub agent not to report back, but to just do the job
```

### 3. Reference Existing Patterns

```bash
✅ GOOD:
add calendar sync following the same pattern as employee sync use a sub agent. Tell the sub agent not to report back, but to just do the job
```

## Cheat Sheet for Daily Use

```bash
# Morning: Start new features
add [feature name] to CupsUp Scheduler use a sub agent. Tell the sub agent not to report back, but to just do the job

# Mid-day: Testing
test all new functionality and fix any issues use a sub agent. Tell the sub agent not to report back, but to just do the job

# Afternoon: Documentation
update documentation with today's changes use a sub agent. Tell the sub agent not to report back, but to just do the job

# Evening: Deploy
prepare deployment package and update changelog use a sub agent. Tell the sub agent not to report back, but to just do the job

# NEVER:
/compact  ← Don't use this, ever!
```

## Success Metrics

After adopting this workflow:

- ✅ Build entire project: 5 minutes (vs 2 days)
- ✅ Add 10 features: 15 minutes (vs 1 day)
- ✅ Complete testing: 5 minutes (vs 3 hours)
- ✅ Full documentation: 10 minutes (vs 4 hours)
- ✅ Token usage: < 2% (vs 100% → /compact)

## Conclusion

With sub-agent methodology, CupsUp Scheduler development is:

- **20x faster** - Minutes instead of days
- **Unlimited scope** - Add 100+ features in one session
- **Zero context loss** - Never use /compact
- **Consistent quality** - Same high standards, every time

## Quick Reference

**The ONE command you need to remember:**

```bash
[what you want] use a sub agent. Tell the sub agent not to report back, but to just do the job
```

That's it. Use this for everything, and you'll achieve 93% token savings and unlimited development capacity.

---

**Next:** Print the [Quick Reference Cheatsheet](../CLAUDE_CODE_CHEATSHEET.md) and keep it visible while coding!
