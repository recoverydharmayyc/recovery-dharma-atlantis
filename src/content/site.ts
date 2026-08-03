export const SITE = {
  demoState: "fictional" as const,
  siteTitle: "Recovery Dharma Atlantis",
  siteTitlePrefix: "Recovery Dharma",
  siteTitleLocation: "Atlantis",
  fictionalLabel: "Fictional example",
  footerNotice:
    "Recovery Dharma Atlantis is a fictional tutorial community and does not describe an active meeting.",
  navigation: [
    { to: "/meetings", label: "Meetings" },
    { to: "/about", label: "About" },
    { to: "/newcomers", label: "New Here" },
    { to: "/resources", label: "Resources" },
    { to: "/connect", label: "Connect" },
  ],
} as const;
