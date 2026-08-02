export const ABOUT_CONTENT = {
  hero: {
    eyebrow: "About the practice",
    title: "Recovery is something we practice together.",
    lede:
      "Recovery Dharma communities use meditation, reflection, and shared inquiry as supports for recovery. This fictional site is an educational example, not guidance for a particular person.",
  },
  sections: [
    {
      kicker: "Peer-led",
      title: "No gurus. No hierarchy of recovery.",
      paragraphs: [
        "This example imagines a room where people meet as equals. Each person can take part in the ways that feel right for them.",
        "We do not make medical claims or promise particular outcomes. People are encouraged to use the supports that are right for their own circumstances.",
      ],
      actionRow: undefined,
    },
    {
      kicker: "Practice",
      title: "Meditation, reading, and honest reflection.",
      paragraphs: [
        "Recovery Dharma practice can include quiet meditation, readings, and discussion rooted in lived experience.",
        "A local group should write its own verified description of how it meets and what it offers.",
      ],
      actionRow: {
        secondaryHref: "/resources",
        secondaryLabel: "Explore the sample resource area",
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
    actionLabel: "View the fictional meeting example",
  },
} as const;
