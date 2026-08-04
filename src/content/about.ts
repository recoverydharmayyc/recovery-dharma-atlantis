import { ROUTE_PATHS } from "../config/site";

export const ABOUT_CONTENT = {
  hero: {
    eyebrow: "About the practice",
    title: "Recovery is something we practice together.",
    lede: "Recovery Dharma communities use meditation, reflection, and shared inquiry as supports for recovery. The practice is peer-led and participation is voluntary.",
  },
  sections: [
    {
      kicker: "Peer-led",
      title: "No gurus. No hierarchy of recovery.",
      paragraphs: [
        "People meet as equals and speak from lived experience. No participant acts as a guru or holds authority over another person’s recovery.",
        "The community does not make medical claims or promise particular outcomes.",
      ],
      actionRow: undefined,
    },
    {
      kicker: "Practice",
      title: "Meditation, reading, and honest reflection.",
      paragraphs: [
        "A meeting can include quiet meditation, readings, and discussion rooted in lived experience.",
        "The practice leaves room for each person to decide what supports are right for their own circumstances.",
      ],
      actionRow: {
        secondaryHref: ROUTE_PATHS.resources,
        secondaryLabel: "Explore Recovery Dharma resources",
      },
    },
  ],
  rhythm: {
    kicker: "A meeting rhythm",
    title: "A calm, ordinary sequence.",
    steps: [
      "Arrive and settle in.",
      "Sit together for a short meditation.",
      "Read, reflect, and share if you wish.",
      "Leave with no pressure to do more than you are ready for.",
    ],
    actionLabel: "View meeting times",
  },
} as const;
