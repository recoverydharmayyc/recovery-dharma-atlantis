import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getActiveAnnouncement } from "../announcements/announcementTiming";
import { SITE_CONFIG } from "../config/site";
import AnnouncementBar from "./AnnouncementBar";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./layout/LayoutPolish.css";

export default function SiteLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [now, setNow] = useState(() => new Date());
  const firstRoute = useRef(true);
  const announcement = getActiveAnnouncement(now);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), SITE_CONFIG.clockRefreshMs);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector<HTMLElement>("#main-content")?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="app-shell" data-demo-state={SITE_CONFIG.demoState}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      {announcement && <AnnouncementBar announcement={announcement} />}
      <div className="route-transition-surface">
        <main id="main-content" className="site-main" tabIndex={-1}>
          <div className="page">{children}</div>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}
