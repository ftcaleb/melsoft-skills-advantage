/**
 * The Skills Advantage — RSVP leads → Google Sheet.
 *
 * Receives each RSVP from https://melsoft-skills-advantage.vercel.app
 * (src/registration.js) and appends one row to the "RSVPs" tab.
 *
 * Its own project on purpose: the Skills Capital Webinar project runs a
 * webinar email sequence over its own registration tabs, and an RSVP for
 * this event must never be swept into another event's emails.
 *
 * ── Setup (standalone project) ─────────────────────────────────────────────
 *  1. script.google.com → New project. Name it "Skills Advantage RSVPs".
 *  2. Replace Code.gs with this file. Save.
 *  3. Choose `setup` in the function menu → Run. Allow the permissions.
 *     It creates a sheet called "Skills Advantage RSVPs" in your Drive (or
 *     uses SHEET_ID below if you filled it in) and logs its link.
 *  4. Deploy → New deployment → ⚙ Select type → Web app.
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Copy the Web app URL (ends in /exec).
 *  5. Vercel → melsoft-skills-advantage → Settings → Environment Variables:
 *       VITE_REGISTRATION_ENDPOINT = <that URL>   (Production)
 *     then redeploy the site. The form only goes live after the redeploy.
 *  6. Open the /exec URL in a browser: it should say "result": "ok".
 *     Then send one test RSVP from the site and check the sheet.
 *
 *  ⚠️ After editing this file, deploy a NEW VERSION
 *     (Deploy → Manage deployments → ✏️ → Version: New version → Deploy).
 *     Saving alone leaves the live URL running the old code.
 *
 * ── Columns ────────────────────────────────────────────────────────────────
 * Written by header NAME, so a column moved or added by hand never shifts
 * the data. A header missing from row 1 is added to the end of it.
 */

// ── Config ──────────────────────────────────────────────────────────────────

var CONFIG = {
  // Leave "" and run setup() to create a new sheet, or paste the ID of an
  // existing one (the long part of its URL between /d/ and /edit).
  SHEET_ID: "1lYGF4yz4Qv1vLN7RDXj3boEdBa2Ii3xje5P15m4T4B0",
  SHEET_NAME: "Skills Advantage RSVPs",
  TAB: "RSVPs",

  // Optional: an inbox to alert on every new RSVP, e.g. "business@melsoftacademy.com".
  // Leave "" for no alerts. Sends from the account that owns this script.
  NOTIFY_TO: "",
};

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
  ["Repeat", "_repeat"],   // "Yes" when this email has RSVP'd before
];

// Longest value kept per cell — a form field cannot be used to dump
// kilobytes of text into the sheet.
var MAX_LEN = 300;

// ── Entry points ───────────────────────────────────────────────────────────

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ result: "error", error: "Busy, please try again" });
  }

  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    var name = clean_(data.name);
    var email = clean_(data.email).toLowerCase();
    if (!name) return json_({ result: "error", error: "A name is required" });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json_({ result: "error", error: "A valid email is required" });
    }
    data.name = name;
    data.email = email;

    var sheet = getSheet_();
    var headers = ensureHeaders_(sheet);
    data._repeat = seenBefore_(sheet, headers, email) ? "Yes" : "";

    var row = headers.map(function (h) {
      var key = keyFor_(h);
      if (!key) return "";                                   // a column added by hand
      if (key === "timestamp") return data.timestamp || new Date().toISOString();
      return clean_(data[key]);
    });
    sheet.appendRow(row);

    notify_(data);
    return json_({ result: "success" });
  } catch (err) {
    console.error(err);
    return json_({ result: "error", error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Opening the /exec URL in a browser shows this — a quick "is it live?". */
function doGet() {
  return json_({ result: "ok", service: "skills-advantage-rsvp" });
}

/**
 * Run once from the editor. Creates the sheet if needed, writes the header
 * row, and logs the sheet's link.
 */
function setup() {
  var ss = openSpreadsheet_(true);
  var sheet = getSheet_();
  ensureHeaders_(sheet);
  Logger.log("Sheet ready: %s", ss.getUrl());
  Logger.log("Next: Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).");
}

/** Run from the editor to check the sheet end to end without the website. */
function testRsvp() {
  var res = doPost({ postData: { contents: JSON.stringify({
    timestamp: new Date().toISOString(),
    event: "skills-advantage-2026",
    name: "Test Person",
    email: "test@example.com",
    phone: "082 000 0000",
    company: "Test Co",
    attendance: "In person (Sandton / Rosebank)",
    role: "Other",
    dietary: "",
    source: "apps-script-test",
  }) } });
  Logger.log(res.getContent());
  Logger.log("Delete the test row from the sheet afterwards.");
}

// ── Sheet plumbing ──────────────────────────────────────────────────────────

/**
 * The spreadsheet, in order of preference: CONFIG.SHEET_ID, the one setup()
 * created (remembered in Script Properties), or — only when `create` is
 * true — a new one.
 */
function openSpreadsheet_(create) {
  if (CONFIG.SHEET_ID) return SpreadsheetApp.openById(CONFIG.SHEET_ID);

  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);

  if (!create) throw new Error("No sheet yet: run setup() once from the editor.");
  var ss = SpreadsheetApp.create(CONFIG.SHEET_NAME);
  props.setProperty("SHEET_ID", ss.getId());
  return ss;
}

function getSheet_() {
  var ss = openSpreadsheet_(false);
  var sheet = ss.getSheetByName(CONFIG.TAB);
  if (!sheet) {
    // A brand-new spreadsheet has an empty "Sheet1"; reuse it rather than
    // leaving a blank tab beside the real one.
    var first = ss.getSheets()[0];
    sheet = first && first.getLastRow() === 0 && ss.getSheets().length === 1
      ? first.setName(CONFIG.TAB)
      : ss.insertSheet(CONFIG.TAB);
  }
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

function keyFor_(header) {
  for (var i = 0; i < COLUMNS.length; i++) if (COLUMNS[i][0] === header) return COLUMNS[i][1];
  return null;
}

function seenBefore_(sheet, headers, email) {
  var col = headers.indexOf("Email");
  var last = sheet.getLastRow();
  if (col === -1 || last < 2) return false;
  var values = sheet.getRange(2, col + 1, last - 1, 1).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === email) return true;
  }
  return false;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Trimmed, length-capped text. A leading = + - @ is prefixed with an
 * apostrophe so Sheets stores it as text instead of running it as a
 * formula (e.g. a "name" of =HYPERLINK(...)).
 */
function clean_(v) {
  var s = String(v == null ? "" : v).trim().slice(0, MAX_LEN);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function notify_(data) {
  if (!CONFIG.NOTIFY_TO) return;
  try {
    MailApp.sendEmail({
      to: CONFIG.NOTIFY_TO,
      subject: "New RSVP — The Skills Advantage: " + data.name,
      body:
        data.name + " (" + data.email + ")\n" +
        [data.role, data.company].filter(Boolean).join(", ") + "\n" +
        "Phone: " + (data.phone || "-") + "\n" +
        "Attending: " + (data.attendance || "-") + "\n" +
        (data.dietary ? "Dietary: " + data.dietary + "\n" : "") +
        "Source: " + (data.source || "-") + "\n" +
        (data._repeat ? "\nThis email has RSVP'd before.\n" : ""),
    });
  } catch (err) {
    console.error("RSVP alert failed: " + err);   // never fails the RSVP itself
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
