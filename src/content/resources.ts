export type Resource = {
  title: string;
  description: string;
  action: string;
  href?: string;
  internal?: boolean;
};

export const RESOURCES_CONTENT = {
  hero: {
    eyebrow: "Resources",
    title: "Practice can start with a few good places to look.",
    lede: "These general Recovery Dharma resources are offered for exploration. They are not a substitute for individual care or advice.",
  },
  sections: {
    local: {
      kicker: "Start here",
      title: "A few ways into the practice.",
      items: [
        {
          title: "Beginners",
          description: "An official Recovery Dharma introduction for people getting started.",
          action: "Explore beginners’ resources",
          href: "https://recoverydharma.org/get-started/beginners/",
        },
        {
          title: "The Recovery Dharma book",
          description: "Read about the practice and its approach to recovery.",
          action: "Visit the book page",
          href: "https://recoverydharma.org/book/",
        },
        {
          title: "Meditations",
          description: "Browse official guided meditation resources.",
          action: "Explore meditations",
          href: "https://recoverydharma.org/resources/meditations/",
        },
      ],
    },
    core: {
      kicker: "Meeting practice",
      title: "Bring the essentials into the room.",
      items: [
        {
          title: "Meeting materials",
          description: "Official Recovery Dharma materials for meetings and shared practice.",
          action: "View meeting materials",
          href: "https://recoverydharma.org/resources/meeting-materials/",
        },
        {
          title: "Friends and mentors",
          description: "Learn about peer relationships within the Recovery Dharma community.",
          action: "Explore friends and mentors",
          href: "https://recoverydharma.org/resources/friends-mentors/",
        },
        {
          title: "Glossary",
          description: "A plain-language reference for common Recovery Dharma terms.",
          action: "Read the glossary",
          href: "https://recoverydharma.org/glossary/",
        },
      ],
    },
    practice: {
      kicker: "Atlantis example",
      title: "Find a fictional local meeting.",
      items: [
        {
          title: "Meeting times",
          description:
            "See the two fictional Atlantis gatherings used throughout this tutorial project.",
          action: "View fictional meetings",
          href: "/meetings",
          internal: true,
        },
      ],
    },
  },
} as const;
