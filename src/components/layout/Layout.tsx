import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  getActiveAnnouncement,
  shouldRenderAnnouncementBanner,
} from "../../announcements/announcementTiming";
import { SITE } from "../../content/site";
import { MINUTE_MS } from "../../meetings/time";
import { routeTransitionMotion } from "./routeTransition";
import "../../index.css";
import "./LayoutPolish.css";
import Footer from "./Footer";

function scrollAppToTop() {
  document.querySelector<HTMLElement>(".app-shell")?.scrollTo({ top: 0, left: 0 });
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export default function Layout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const menuRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const announcement = getActiveAnnouncement(now);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), MINUTE_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setOpen(false);
    scrollAppToTop();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  const navLinks = SITE.navigation.map((item) => (
    <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
      {item.label}
    </NavLink>
  ));

  return (
    <div className="app-shell" data-demo-state={SITE.demoState}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container">
          <div className="header-bar">
            <p className="site-title">
              <NavLink
                to="/"
                end
                className="site-title-link"
                aria-label="Recovery Dharma Atlantis home"
              >
                <span className="site-title-icon" aria-hidden="true" />
                <span>
                  {SITE.siteTitlePrefix}{" "}
                  <span className="site-title-location">{SITE.siteTitleLocation}</span>
                </span>
              </NavLink>
              <span className="fictional-label">{SITE.fictionalLabel}</span>
            </p>
            <div className="header-actions">
              <nav className="nav-inline" aria-label="Primary navigation">
                {navLinks}
              </nav>
              <div className="nav-pop" ref={menuRef} data-fictional-label={SITE.fictionalLabel}>
                <button
                  className="nav-toggle"
                  aria-label={open ? "Close menu" : "Open menu"}
                  type="button"
                  aria-controls="mobile-nav"
                  aria-expanded={open}
                  onClick={() => setOpen((value) => !value)}
                >
                  <span className="nav-toggle-icon" aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.nav
                      id="mobile-nav"
                      className="nav-sheet"
                      aria-label="Mobile navigation"
                      initial={reduceMotion ? false : { opacity: 0, y: -6, scaleY: 0.96 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6, scaleY: 0.96 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.18, ease: [0.25, 0.8, 0.25, 1] }
                      }
                      style={{ originX: 1, originY: 0 }}
                    >
                      {navLinks}
                    </motion.nav>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {shouldRenderAnnouncementBanner(announcement) && announcement && (
        <aside
          className={
            "site-status-banner site-status-banner--announcement site-status-banner--" +
            announcement.tone
          }
          aria-label={announcement.ariaLabel}
        >
          <div className="container site-status-banner-container">
            <NavLink to={announcement.href} className="site-status-banner-inner">
              <span className="site-status-banner-accent" aria-hidden="true" />
              <span className="site-status-banner-copy">
                <span className="site-status-banner-label">{announcement.label}</span>
                <span className="site-status-banner-main">
                  <strong className="site-status-banner-title">{announcement.title}</strong>
                  <span className="site-status-banner-meta">{announcement.details}</span>
                </span>
              </span>
            </NavLink>
          </div>
        </aside>
      )}

      <motion.div
        key={pathname}
        className="route-transition-surface"
        initial={reduceMotion ? false : routeTransitionMotion.initial}
        animate={reduceMotion ? undefined : routeTransitionMotion.animate}
        transition={reduceMotion ? { duration: 0 } : routeTransitionMotion.transition}
      >
        <main id="main-content" className="site-main" tabIndex={-1}>
          <Outlet />
        </main>
      </motion.div>

      <Footer />
    </div>
  );
}
