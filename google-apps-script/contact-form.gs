/**
 * SVC Tech AI — Contact form → Google Sheets (multi-tab)
 *
 * One spreadsheet, four tabs: Contact | Products | Services | Education
 * Submissions are routed by the "source" field from the website.
 *
 * Setup:
 * 1. Create a Google Sheet in Google Drive.
 * 2. (Optional) Rename tabs to Contact, Products, Services, Education — or let this script create them.
 * 3. Extensions → Apps Script → paste this file → Save.
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app URL into Vercel env var GOOGLE_SCRIPT_URL.
 */

var SHEET_MAP = {
  products: 'Products',
  services: 'Services',
  education: 'Education',
  contact: 'Contact',
};

var HEADERS = [
  'Timestamp',
  'Source',
  'Full Name',
  'Work Email',
  'Company',
  'Phone',
  'Areas of Interest',
  'Project Brief',
  'Budget Range',
  'Timeline',
];

function getOrCreateSheet_(source) {
  var key = String(source || 'contact').toLowerCase();
  var sheetName = SHEET_MAP[key] || SHEET_MAP.contact;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, error: 'Missing request body' });
    }

    var data = JSON.parse(e.postData.contents);
    var source = String(data.source || 'contact').toLowerCase();
    var sheet = getOrCreateSheet_(source);

    sheet.appendRow([
      new Date(),
      source,
      data.fullName || '',
      data.email || '',
      data.company || '',
      data.phone || '',
      Array.isArray(data.interests) ? data.interests.join(', ') : (data.interests || ''),
      data.brief || '',
      data.budget || '',
      data.timeline || '',
    ]);

    return jsonResponse_({ success: true, sheet: sheet.getName() });
  } catch (err) {
    return jsonResponse_({ success: false, error: String(err.message || err) });
  }
}

function doGet() {
  return jsonResponse_({
    success: true,
    message: 'SVC contact form endpoint is active.',
    sheets: Object.keys(SHEET_MAP).map(function (k) { return SHEET_MAP[k]; }),
  });
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
