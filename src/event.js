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
    "Join C-Suite Executives and Transformation Leaders to bridge South Africa's skills gap " +
    "and secure enterprise compliance.",
  details: [
    { icon: "calendar", main: "Thursday, November 2026" },
    { icon: "clock", main: "15:30 – 17:30 SAST", note: "Executive networking & dinner 17:45 – 18:30" },
    { icon: "pin", main: "Sandton / Rosebank Executive Conference Centre", note: "& virtual livestream" },
  ],
};

/* `value` is what lands in the sheet, worded as the visitor read it. */
export const ATTENDANCE = [
  { value: "In person (Sandton / Rosebank)", label: "In person", note: "Sandton / Rosebank" },
  { value: "Virtual stream", label: "Virtual stream", note: "Watch live online" },
];
export const IN_PERSON = ATTENDANCE[0].value;

export const MAIN_SITE = "https://www.melsoftacademy.com";
