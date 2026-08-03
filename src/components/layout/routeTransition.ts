export const ROUTE_TRANSITION_OWNER = "layout-incoming-only" as const;

export const routeTransitionMotion = {
  initial: { opacity: 0.97, y: 3 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.14, ease: "easeOut" },
} as const;
