export const ABOUT_CONTENT = {
  hero: {
    eyebrow: "About the practice",
    title: "Recovery is something we practice together.",
    lede: "Recovery Dharma communities use meditation, reflection, and shared inquiry as supports for recovery. This fictional example describes a peer-led approach, not individual guidance.",
  },
  sections: [
    {
      kicker: "Peer-led",
      title: "No gurus. No hierarchy of recovery.",
      paragraphs: [
        "This imagined community is a place where people meet as equals. Each person can take part in ways that feel right for them.",
        "Recovery Dharma Atlantis does not make medical claims or promise particular outcomes.",
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
        secondaryHref: "/resources",
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
    actionLabel: "View fictional meeting times",
  },
} as const;
