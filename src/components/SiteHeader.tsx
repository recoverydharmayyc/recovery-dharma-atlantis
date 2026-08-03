import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { NAVIGATION_ROUTES, ROUTE_PATHS } from "../config/site";
import { SITE } from "../content/site";

export default function SiteHeader() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(({ restoreFocus = false } = {}) => {
    setOpen(false);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const navLinks = NAVIGATION_ROUTES.map((item) => (
    <NavLink key={item.path} to={item.path} onClick={() => closeMenu()}>
      {item.label}
    </NavLink>
  ));

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-bar">
          <p className="site-title">
            <NavLink
              to={ROUTE_PATHS.home}
              end
              className="site-title-link"
              aria-label={`${SITE.siteTitle} home`}
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
                ref={triggerRef}
                className="nav-toggle"
                aria-label={open ? "Close menu" : "Open menu"}
                type="button"
                aria-controls="mobile-nav"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
              >
                <span className="nav-toggle-icon" aria-hidden="true" />
              </button>
              {open && (
                <nav id="mobile-nav" className="nav-sheet" aria-label="Mobile navigation">
                  {navLinks}
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
