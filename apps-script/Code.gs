/**
 * The Skills Advantage — RSVP form → Google Sheet.
 *
 * Receives each RSVP from the page (src/registration.js) and appends one row
 * to the "RSVPs" tab of the sheet this script is bound to.
 *
 * Deliberately separate from the Skills Capital Webinar project: that one
 * runs a webinar email sequence that reads its own registration tabs, and an
 * RSVP for this event must never be swept into another event's emails.
 *
 * ── One-time setup ─────────────────────────────────────────────────────────
 *  1. Create a new Google Sheet, e.g. "Skills Advantage RSVPs".
 *  2. Extensions → Apps Script. Replace Code.gs with this file. Save.
 *  3. Deploy → New deployment → type "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Authorise when asked.
 *  4. Copy the Web app URL (ends in /exec) into the site's .env as
 *     VITE_REGISTRATION_ENDPOINT, and into the hosting provider's
 *     environment variables, then rebuild/redeploy the site.
 *
 *  ⚠️ After changing this file, deploy a NEW VERSION
 *     (Deploy → Manage deployments → ✏️ → Version: New version → Deploy),
 *     or the live URL keeps running the old code.
 *
 * ── Columns ────────────────────────────────────────────────────────────────
 * Written by header NAME, so a column added or moved by hand never shifts
 * the data. Any header missing from row 1 is added to the end of it.
 */

var TAB = "RSVPs";

// Sheet header → payload key, in the order columns are created.
var COLUMNS = [
  ["Timestamp", "timestamp"],
  ["Full Name", "name"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["Job Title", "role"],
  ["Company", "company"],
  ["Attendance", "attendance"],
  ["Dietary Requirements", "dietary"],
  ["Source", "source"],
  ["Event", "event"],
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);

    var email = String(data.email || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json_({ result: "error", error: "A valid email is required" });
    }
    if (!String(data.name || "").trim()) {
      return json_({ result: "error", error: "A name is required" });
    }

    var sheet = getSheet_();
    var headers = ensureHeaders_(sheet);

    var row = headers.map(function (h) {
      for (var i = 0; i < COLUMNS.length; i++) {
        if (COLUMNS[i][0] === h) {
          var v = data[COLUMNS[i][1]];
          if (COLUMNS[i][1] === "timestamp") return v || new Date().toISOString();
          return v == null ? "" : String(v).trim();
        }
      }
      return ""; // a column someone added by hand
    });
    sheet.appendRow(row);

    return json_({ result: "success" });
  } catch (err) {
    return json_({ result: "error", error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the /exec URL in a browser shows this — a quick "is it live?". */
function doGet() {
  return json_({ result: "ok", service: "skills-advantage-rsvp" });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TAB) || ss.insertSheet(TAB);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(function (c) { return c[0]; }));
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight("bold").setBackground("#5e0743").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Row 1 as an array, with any missing COLUMNS header appended to it. */
function ensureHeaders_(sheet) {
  var width = Math.max(sheet.getLastColumn(), 1);
  var names = sheet.getRange(1, 1, 1, width).getValues()[0]
    .map(function (h) { return String(h).trim(); });
  COLUMNS.forEach(function (c) {
    if (names.indexOf(c[0]) === -1) {
      names.push(c[0]);
      sheet.getRange(1, names.length).setValue(c[0]);
    }
  });
  return names;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
