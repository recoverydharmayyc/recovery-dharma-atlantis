export type Resource = {
  title: string;
  description: string;
  source: string;
  href: string;
};

export const RESOURCES_CONTENT = {
  hero: {
    eyebrow: "Recovery Dharma resources",
    title: "Official resources",
    lede: "Use these Recovery Dharma Global pages for books, meeting listings, practice material, and meditation.",
  },
  items: [
    {
      title: "Read the Recovery Dharma book",
      description: "Find the book in free and paid formats.",
      source: "Recovery Dharma Global",
      href: "https://recoverydharma.org/book/",
    },
    {
      title: "Find a Recovery Dharma meeting",
      description: "Search the public directory for local and online meetings.",
      source: "Recovery Dharma Global",
      href: "https://recoverydharma.org/meetings/",
    },
    {
      title: "Meeting materials",
      description: "Review sample formats, standard readings, and meeting material.",
      source: "Recovery Dharma Global",
      href: "https://recoverydharma.org/resources/meeting-materials/",
    },
    {
      title: "Meditation resources",
      description: "Browse community-contributed meditation scripts and recordings.",
      source: "Recovery Dharma Global",
      href: "https://recoverydharma.org/resources/meditations/",
    },
    {
      title: "The Recovery Dharma practice",
      description: "Read an outline of the program’s main areas of practice.",
      source: "Recovery Dharma Global",
      href: "https://recoverydharma.org/project/the-practice/",
    },
  ] satisfies readonly Resource[],
} as const;
