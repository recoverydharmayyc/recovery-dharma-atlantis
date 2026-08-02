import { MEETING } from "./site";

export const MEETINGS_CONTENT = {
  hero: {
    kicker: "Fictional local example",
    title: "A simple place to begin.",
    lede:
      "This sample listing shows the kind of clear, verified information a real community would share. It is not an active meeting listing.",
  },
  meeting: {
    eyebrow: MEETING.format,
    title: "Wednesday evening meeting",
    description:
      "A fictional one-hour peer-led gathering with time for meditation, a reading, and voluntary sharing.",
    metaLines: [MEETING.day, MEETING.time, MEETING.venue, MEETING.newcomerNote, MEETING.registrationNote],
  },
  note: {
    kicker: "Before a real launch",
    title: "Replace sample details only with verified facts.",
    body:
      "A real group would confirm its public schedule, venue, access information, and contact method before asking anyone to attend.",
  },
} as const;
