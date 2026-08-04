import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAVIGATION_ROUTES, ROUTE_PATHS } from "../config/site";
import { SITE } from "../content/site";
import BrandMark from "./BrandMark";

export default function SiteHeader() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(({ restoreFocus = false } = {}) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu({ restoreFocus: true });
    }
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) closeMenu();
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [closeMenu, open]);

  const navLinks = NAVIGATION_ROUTES.map((route) => (
    <NavLink key={route.path} to={route.path} onClick={() => closeMenu()}>
      {route.label}
    </NavLink>
  ));

  return (
    <header className="site-header">
      <div className="site-container masthead">
        <NavLink className="brand-link" to={ROUTE_PATHS.home} aria-label={`${SITE.siteTitle} home`}>
          <BrandMark />
          <span className="brand-copy">
            <span className="brand-name brand-name--full">{SITE.siteTitle}</span>
            <span className="brand-name brand-name--short">RD Atlantis</span>
            <span className="fictional-label">{SITE.fictionalLabel}</span>
          </span>
        </NavLink>

        <nav className="primary-nav" aria-label="Primary navigation">
          {navLinks}
        </nav>

        <div className="mobile-nav" ref={menuRef}>
          <button
            ref={triggerRef}
            className="menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-icon" aria-hidden="true" />
          </button>
          {open && (
            <nav className="mobile-nav-panel" id="mobile-navigation" aria-label="Mobile navigation">
              {navLinks}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
