export const SITE_CONFIG = {
  demoMode: true,
  demoState: "fictional",
  clockRefreshMs: 60_000,
} as const;

export const ROUTE_PATHS = {
  home: "/",
  meetings: "/meetings",
  about: "/about",
  newcomers: "/newcomers",
  resources: "/resources",
  connect: "/connect",
} as const;

export type SiteRouteId = keyof typeof ROUTE_PATHS;

export type SiteRoute = {
  id: SiteRouteId;
  path: (typeof ROUTE_PATHS)[SiteRouteId];
  label: string;
  navigation: boolean;
};

export const SITE_ROUTES: readonly SiteRoute[] = [
  { id: "home", path: ROUTE_PATHS.home, label: "Home", navigation: false },
  { id: "meetings", path: ROUTE_PATHS.meetings, label: "Meetings", navigation: true },
  { id: "about", path: ROUTE_PATHS.about, label: "About", navigation: true },
  { id: "newcomers", path: ROUTE_PATHS.newcomers, label: "New Here", navigation: true },
  { id: "resources", path: ROUTE_PATHS.resources, label: "Resources", navigation: true },
  { id: "connect", path: ROUTE_PATHS.connect, label: "Connect", navigation: true },
] as const;

export const NAVIGATION_ROUTES = SITE_ROUTES.filter((route) => route.navigation);

export function isSafeSiteHref(value: unknown): value is string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return false;
  const [path] = value.split("#", 1);
  return SITE_ROUTES.some((route) => route.path === path);
}
