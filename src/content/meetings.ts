import { ATLANTIS_TIME_ZONE, type DayIndex } from "../meetings/meetingTime";

export type LocalMeeting = {
  id: string;
  title: string;
  tabLabel: string;
  day: string;
  dayIndex: DayIndex;
  displayTime: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  timeZoneLabel: string;
  format: "In person";
  venue: string;
  verifiedPublicLink: string | null;
  description: string;
  recurrence: "weekly";
  newcomerNote: string;
  registrationNote: string;
};

export type TemporaryMeetingOccurrence = {
  date: string;
  startTime: string;
  endTime: string;
  timeZone: string;
};

export type TemporaryMeeting = {
  enabled: boolean;
  derivedFromMeetingId: string | null;
  title: string;
  shortBannerLabel: string;
  shortBannerText: string;
  occurrences: TemporaryMeetingOccurrence[];
  format: "In person" | "Online";
  venueOrOnlineDescription: string;
  verifiedPublicLink: string | null;
  note: string;
};

export const ATLANTIS_TIME_ZONE_LABEL = "Atlantis time (UTC-3)";

export const LOCAL_MEETINGS: readonly LocalMeeting[] = [
  {
    id: "wednesday-evening",
    title: "Wednesday Evening",
    tabLabel: "Wednesday",
    day: "Wednesday",
    dayIndex: 3,
    displayTime: "7:00 p.m. to 8:00 p.m.",
    startTime: "19:00",
    endTime: "20:00",
    timeZone: ATLANTIS_TIME_ZONE,
    timeZoneLabel: ATLANTIS_TIME_ZONE_LABEL,
    format: "In person",
    venue: "Atlantis Community Room",
    verifiedPublicLink: null,
    description: "A fictional peer-led hour for meditation, reading, and voluntary sharing.",
    recurrence: "weekly",
    newcomerNote: "Newcomers welcome",
    registrationNote: "No registration required",
  },
  {
    id: "sunday-morning",
    title: "Sunday Morning",
    tabLabel: "Sunday",
    day: "Sunday",
    dayIndex: 0,
    displayTime: "10:00 a.m. to 11:00 a.m.",
    startTime: "10:00",
    endTime: "11:00",
    timeZone: ATLANTIS_TIME_ZONE,
    timeZoneLabel: ATLANTIS_TIME_ZONE_LABEL,
    format: "In person",
    venue: "Atlantis Community Room",
    verifiedPublicLink: null,
    description: "A fictional peer-led morning practice with space to listen or share.",
    recurrence: "weekly",
    newcomerNote: "Newcomers welcome",
    registrationNote: "No registration required",
  },
] as const;

export const MEETINGS_PAGE_CONTENT = {
  hero: {
    kicker: "Atlantis gatherings",
    title: "Find a time to sit together.",
    lede: "These are fictional sample listings for the tutorial community. They show how a local group can make meeting details clear without inventing information.",
  },
  global: {
    kicker: "Worldwide online meetings",
    title: "Explore Recovery Dharma Global listings.",
    disclosure:
      "Worldwide listings are loaded from Recovery Dharma Global’s public meeting directory. This preview may be incomplete, delayed, or unavailable. Verify meeting details in the full directory before attending.",
    directoryLabel: "Open the full Recovery Dharma Global directory",
  },
} as const;
