import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getActiveAnnouncement } from "../announcements/announcementTiming";
import { SITE_CONFIG } from "../config/site";
import AnnouncementBar from "./AnnouncementBar";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [now, setNow] = useState(() => new Date());
  const mainRef = useRef<HTMLElement>(null);
  const firstRoute = useRef(true);
  const announcement = getActiveAnnouncement(now);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), SITE_CONFIG.clockRefreshMs);
    return () => window.clearInterval(intervalId);
  }, []);

  useLayoutEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    const main = mainRef.current;
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    main?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="site-shell" data-demo-state={SITE_CONFIG.demoState}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      {announcement && <AnnouncementBar announcement={announcement} />}
      <main ref={mainRef} id="main-content" className="site-main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
