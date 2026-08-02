export const SITE = {
  demoState: "fictional" as const,
  siteTitle: "Recovery Dharma Atlantis",
  notice: {
    label: "Tutorial demonstration",
    title: "Recovery Dharma Atlantis is fictional and is not a real meeting.",
    meta: "Sample information only — verify every public fact before publishing.",
  },
  footerNotice:
    "Fictional tutorial example. It does not describe an active Recovery Dharma meeting.",
  navigation: [
    { to: "/meetings", label: "Meeting" },
    { to: "/about", label: "About" },
    { to: "/newcomers", label: "New Here" },
    { to: "/resources", label: "Resources" },
    { to: "/connect", label: "Connect" },
  ],
} as const;

export const MEETING = {
  day: "Wednesday",
  time: "7:00 p.m. to 8:00 p.m.",
  format: "In person",
  venue: "Atlantis Community Room",
  newcomerNote: "Newcomers welcome",
  registrationNote: "No registration required",
} as const;
