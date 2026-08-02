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
    title: "Leave room for verified sources.",
    lede:
      "This fictional starter keeps its resource area deliberately modest. A real group should add only links and materials it has reviewed and approved.",
  },
  sections: {
    local: {
      kicker: "For an adopting group",
      title: "Public information to verify first.",
      items: [
        {
          title: "Meeting details",
          description: "Confirm the schedule, format, venue, and newcomer information.",
          action: "Review sample meeting",
          href: "/meetings",
          internal: true,
        },
        {
          title: "Contact method",
          description: "Add a public contact method only after it is verified and ready to receive messages.",
          action: "Review sample contact area",
          href: "/connect",
          internal: true,
        },
        {
          title: "Access information",
          description: "Publish access details only when the group has confirmed them.",
          action: "Keep unknown information unknown",
        },
      ],
    },
    core: {
      kicker: "Placeholder area",
      title: "Approved practice resources go here.",
      items: [
        {
          title: "A verified reading",
          description: "A real group may add an approved public reading or book reference here.",
          action: "Add only after approval",
        },
        {
          title: "A verified local resource",
          description: "A real group may add a carefully reviewed local resource here.",
          action: "Add only after approval",
        },
        {
          title: "A verified support link",
          description: "A real group may add a public support link here once it has been checked.",
          action: "Add only after approval",
        },
      ],
    },
    practice: {
      kicker: "A gentle reminder",
      title: "This template does not replace care or advice.",
      items: [
        {
          title: "Use what is appropriate for you",
          description:
            "This fictional website makes no treatment claims and does not offer individual guidance.",
          action: "Read the fictional-site notice",
        },
      ],
    },
  },
} as const;
