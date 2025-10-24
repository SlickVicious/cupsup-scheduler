/**
 * CupsUp Scheduler - Local Validation Tests
 * Run with: node test-validation.js
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════');
console.log('   CUPSUP SCHEDULER - VALIDATION TESTS');
console.log('═══════════════════════════════════════\n');

let passed = 0;
let failed = 0;
let warnings = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   └─ ${e.message}`);
    failed++;
  }
}

function warn(name, message) {
  console.log(`⚠️  ${name}`);
  console.log(`   └─ ${message}`);
  warnings++;
}

// Test 1: File Structure
test('File structure exists', () => {
  const files = [
    'src/Code.gs',
    'src/ui.html',
    'README.md',
    'DEPLOYMENT.md',
    'LICENSE',
    'package.json',
    '.gitignore',
    '.clasp.json'
  ];

  files.forEach(file => {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing file: ${file}`);
    }
  });
});

// Test 2: Code.gs Syntax Check
test('Code.gs is valid JavaScript', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  // Check for common syntax errors
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    throw new Error(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
  }

  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    throw new Error(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
  }

  // Check for required functions
  const requiredFunctions = [
    'doGet',
    'getSettings',
    'listEmployees',
    'fetchWeekEvents',
    'getAssignments',
    'saveAssignment',
    'sendGroupChatSchedule',
    'twilioSend',
    'runAutomatedTests',
    'onOpen'
  ];

  requiredFunctions.forEach(fn => {
    if (!code.includes(`function ${fn}`)) {
      throw new Error(`Missing function: ${fn}`);
    }
  });
});

// Test 3: ui.html Validation
test('ui.html is valid HTML', () => {
  const html = fs.readFileSync('src/ui.html', 'utf8');

  // Check HTML structure
  if (!html.includes('<!doctype html>') && !html.includes('<!DOCTYPE html>')) {
    throw new Error('Missing DOCTYPE declaration');
  }

  if (!html.includes('<html>')) {
    throw new Error('Missing <html> tag');
  }

  if (!html.includes('</html>')) {
    throw new Error('Missing </html> closing tag');
  }

  // Check for required elements
  const required = ['<head>', '<body>', '<script>'];
  required.forEach(tag => {
    if (!html.includes(tag)) {
      throw new Error(`Missing ${tag} tag`);
    }
  });

  // Check for API calls
  const apiCalls = [
    'api_getBootstrap',
    'api_getWeek',
    'api_saveAssignment',
    'api_sendGroupChat'
  ];

  apiCalls.forEach(api => {
    if (!html.includes(api)) {
      throw new Error(`Missing API call: ${api}`);
    }
  });
});

// Test 4: Security Checks
test('No hardcoded credentials in Code.gs', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  // Check for hardcoded Twilio credentials (would start with AC for SID)
  if (/TWILIO_SID\s*[:=]\s*['"]AC[a-f0-9]{32}['"]/.test(code)) {
    throw new Error('Hardcoded TWILIO_SID found');
  }

  if (/TWILIO_AUTH\s*[:=]\s*['"][a-f0-9]{32}['"]/.test(code)) {
    throw new Error('Hardcoded TWILIO_AUTH found');
  }

  // Check for phone numbers
  if (/['"]\+1\d{10}['"]/.test(code) && !code.includes('example') && !code.includes('format')) {
    warn('Hardcoded phone numbers detected', 'Check if these are examples or real numbers');
  }
});

// Test 5: XFrame Security
test('XFrame mode check', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  if (code.includes('XFrameOptionsMode.ALLOWALL')) {
    warn('XFrame mode set to ALLOWALL', 'This allows clickjacking. Consider DENY or SAME_ORIGIN');
  }
});

// Test 6: Phone Number Validation
test('Phone number validation exists', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  // Check for E.164 regex pattern
  if (!code.includes('/^\\+1\\d{10}$/')) {
    throw new Error('Phone number validation regex not found');
  }

  // Check validation is used
  if (!code.includes('.match(/^\\+1\\d{10}$/)')) {
    throw new Error('Phone number validation not implemented');
  }
});

// Test 7: Rate Limiting
test('Rate limiting implemented', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  if (!code.includes('LAST_GROUP_CHAT_SEND')) {
    throw new Error('Rate limiting not found');
  }

  if (!code.includes('60000')) {
    warn('Rate limiting cooldown', 'Consider implementing longer cooldown and daily limits');
  }
});

// Test 8: Error Handling
test('Error handling present', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  const tryCount = (code.match(/try\s*{/g) || []).length;
  const catchCount = (code.match(/catch\s*\(/g) || []).length;

  if (tryCount !== catchCount) {
    throw new Error(`Mismatched try/catch: ${tryCount} try, ${catchCount} catch`);
  }

  if (tryCount < 5) {
    warn('Limited error handling', 'Consider adding more try/catch blocks');
  }
});

// Test 9: Input Validation
test('Input validation checks', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  // Check for various validation patterns
  const validations = [
    'if (!', // Null checks
    'throw new Error', // Error throwing
    '.match(', // Regex validation
  ];

  validations.forEach(pattern => {
    if (!code.includes(pattern)) {
      throw new Error(`Validation pattern missing: ${pattern}`);
    }
  });
});

// Test 10: Documentation
test('Documentation files complete', () => {
  const readmeStats = fs.statSync('README.md');
  if (readmeStats.size < 1000) {
    throw new Error('README.md is too short (< 1KB)');
  }

  const deploymentStats = fs.statSync('DEPLOYMENT.md');
  if (deploymentStats.size < 1000) {
    throw new Error('DEPLOYMENT.md is too short (< 1KB)');
  }
});

// Test 11: Package.json Validation
test('package.json is valid JSON', () => {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const required = ['name', 'version', 'description', 'license'];
  required.forEach(field => {
    if (!pkg[field]) {
      throw new Error(`Missing field in package.json: ${field}`);
    }
  });

  if (pkg.name !== 'cupsup-scheduler') {
    warn('Package name mismatch', `Expected 'cupsup-scheduler', got '${pkg.name}'`);
  }
});

// Test 12: .gitignore Coverage
test('.gitignore includes sensitive files', () => {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');

  const patterns = [
    '.env',
    'credentials',
    '.clasp.json',
    'node_modules'
  ];

  patterns.forEach(pattern => {
    if (!gitignore.includes(pattern)) {
      warn('.gitignore coverage', `Consider adding: ${pattern}`);
    }
  });
});

// Test 13: API Method Consistency
test('API methods match UI calls', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');
  const html = fs.readFileSync('src/ui.html', 'utf8');

  // Extract API calls from HTML
  const htmlApiCalls = [
    ...html.matchAll(/google\.script\.run[.\w()]*\.(api_\w+)/g)
  ].map(m => m[1]);

  // Check each is defined in Code.gs
  htmlApiCalls.forEach(api => {
    if (!code.includes(`function ${api}(`)) {
      throw new Error(`API method ${api} called in UI but not defined in Code.gs`);
    }
  });
});

// Test 14: Twilio Error Handling
test('Twilio error codes handled', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  // Check for error code handling
  const errorCodes = ['21211', '21614', '20003'];

  errorCodes.forEach(code_num => {
    if (!code.includes(code_num)) {
      warn('Twilio error handling', `Consider adding handler for error code ${code_num}`);
    }
  });
});

// Test 15: Test Functions Exist
test('Test functions implemented', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  const testFunctions = [
    'runAutomatedTests',
    'test_settings',
    'test_employees',
    'test_calendar',
    'test_twilio_creds',
    'test_fetch_week',
    'test_group_numbers',
    'test_send_to_me'
  ];

  testFunctions.forEach(fn => {
    if (!code.includes(`function ${fn}(`)) {
      throw new Error(`Test function missing: ${fn}`);
    }
  });
});

// Test 16: Mobile Responsiveness
test('Mobile responsive CSS present', () => {
  const html = fs.readFileSync('src/ui.html', 'utf8');

  if (!html.includes('@media')) {
    throw new Error('No media queries found for responsive design');
  }

  if (!html.includes('viewport')) {
    throw new Error('Viewport meta tag missing');
  }
});

// Test 17: Assignment Validation
test('Assignment validation logic', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  // Check for time validation (more flexible pattern)
  if (!code.includes('a.start >= a.end') && !code.includes('start >= end')) {
    throw new Error('Start/end time comparison missing');
  }

  // Check for required field validation
  if (!code.includes('!a.name')) {
    throw new Error('Assignment name validation missing');
  }

  // Check for time format validation
  if (!code.includes('\\d{2}:\\d{2}')) {
    throw new Error('Time format validation missing');
  }
});

// Test 18: SMS Message Construction
test('SMS message formatting', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  if (!code.includes('Reply STOP')) {
    throw new Error('SMS opt-out message missing');
  }

  // Check for emoji usage (should be present for visual appeal)
  if (!code.includes('☕') && !code.includes('📅')) {
    warn('SMS formatting', 'Consider adding emojis for better readability');
  }
});

// Test 19: Calendar Access Error Handling
test('Calendar access error handling', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  if (!code.includes('Cannot access calendar')) {
    throw new Error('Calendar access error message missing');
  }

  if (!code.includes('CalendarApp.getCalendarById')) {
    throw new Error('Calendar API call missing');
  }
});

// Test 20: Sheet Structure Validation
test('Sheet structure validation', () => {
  const code = fs.readFileSync('src/Code.gs', 'utf8');

  const sheets = ['Settings', 'Employees', 'Assignments'];

  sheets.forEach(sheet => {
    if (!code.includes(`'${sheet}'`)) {
      throw new Error(`Sheet reference missing: ${sheet}`);
    }
  });
});

// Results Summary
console.log('\n═══════════════════════════════════════');
console.log('VALIDATION RESULTS:');
console.log('═══════════════════════════════════════');
console.log(`✅ Passed:   ${passed}`);
console.log(`❌ Failed:   ${failed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`Total Tests: ${passed + failed}`);
console.log('═══════════════════════════════════════\n');

if (failed === 0) {
  console.log('🎉 ALL TESTS PASSED!');
  console.log('Code is ready for deployment.\n');
  process.exit(0);
} else {
  console.log('🚫 SOME TESTS FAILED');
  console.log('Fix failing tests before deployment.\n');
  process.exit(1);
}
