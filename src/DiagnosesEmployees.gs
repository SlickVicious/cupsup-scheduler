/* =========================
   DIAGNOSTIC SCRIPT
   Run this to see what's wrong
   ========================= */

function diagnoseTabs() {
  const ss = SpreadsheetApp.getActive();
  const sheets = ss.getSheets();
  
  Logger.log('=== SHEET TABS FOUND ===');
  sheets.forEach(sh => {
    Logger.log(`Tab: "${sh.getName()}" - ${sh.getLastRow()} rows`);
  });
  
  Logger.log('\n=== LOOKING FOR REQUIRED TABS ===');
  const required = ['Settings', 'Employees', 'Assignments'];
  required.forEach(name => {
    const sh = ss.getSheetByName(name);
    if (sh) {
      Logger.log(`✓ Found: ${name}`);
    } else {
      Logger.log(`✗ MISSING: ${name}`);
    }
  });
}

function diagnoseSettings() {
  try {
    const settings = getSettings();
    Logger.log('=== SETTINGS LOADED ===');
    Logger.log(JSON.stringify(settings, null, 2));
  } catch (e) {
    Logger.log('✗ ERROR loading settings: ' + e.message);
  }
}

function diagnoseEmployees() {
  try {
    const employees = listEmployees();
    Logger.log('=== EMPLOYEES LOADED ===');
    Logger.log(`Found ${employees.length} employees`);
    employees.forEach(emp => {
      Logger.log(`  ${emp.Name} - ${emp.Phone}`);
    });
  } catch (e) {
    Logger.log('✗ ERROR loading employees: ' + e.message);
  }
}

function runFullDiagnostic() {
  Logger.log('╔════════════════════════════════════╗');
  Logger.log('║   CUPSUP SCHEDULER DIAGNOSTIC      ║');
  Logger.log('╚════════════════════════════════════╝\n');
  
  diagnoseTabs();
  Logger.log('\n');
  diagnoseSettings();
  Logger.log('\n');
  diagnoseEmployees();
  
  Logger.log('\n╔════════════════════════════════════╗');
  Logger.log('║   DIAGNOSTIC COMPLETE              ║');
  Logger.log('╚════════════════════════════════════╝');
}