/* Everything a visitor reads about the event. The next edition is an edit
   here, not to the layout.

   ⚠️ The date has no day yet ("Thursday, November 2026"), exactly as in the
   design. Fill in the day before the page goes live. */
export const EVENT = {
  id: "skills-advantage-2026",
  titleLead: "The Skills",
  titleAccent: "Advantage",
  name: "The Skills Advantage",
  subtitle: "Navigating Compliance, Tech & Talent in",
  year: "2026",
  intro:
    "Join C-Suite Executives and Transformation Leaders to bridge South Africa’s skills gap " +
    "and secure enterprise compliance. This is a premium peer-to-peer platform to navigate " +
    "regulatory shifts, share best practices, and tackle critical skills shortages.",
  details: [
    { icon: "calendar", main: "Thursday, November 2026" },
    { icon: "clock", main: "15:30 – 17:30 SAST", note: "Executive networking & dinner 17:45 – 18:30" },
    { icon: "pin", main: "Sandton / Rosebank Executive Conference Centre" },
  ],
};

/* In-person only, so every RSVP carries this to the sheet's Attendance column. */
export const ATTENDANCE = "In person (Sandton / Rosebank)";

/* The job title dropdown, exactly as these land in the sheet. */
export const ROLES = [
  "Learning and Development",
  "Human Resources",
  "Information Technology",
  "Transformation",
  "Other",
];

export const MAIN_SITE = "https://www.melsoftacademy.com";
