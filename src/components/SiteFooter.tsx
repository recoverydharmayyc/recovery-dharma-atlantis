import { NavLink } from "react-router-dom";
import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import { NAVIGATION_ROUTES } from "../config/site";
import { SITE } from "../content/site";
import BrandMark from "./BrandMark";
import ExternalLink from "./ExternalLink";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <BrandMark />
          <div>
            <p className="footer-brand__name">{SITE.siteTitle}</p>
            <p className="footer-brand__note">Peer practice, imagined with care.</p>
          </div>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          {NAVIGATION_ROUTES.map((route) => (
            <NavLink key={route.path} to={route.path}>
              {route.label}
            </NavLink>
          ))}
        </nav>
        <div className="footer-fine-print">
          <p>{SITE.footerNotice}</p>
          <p>{SITE.independenceNotice}</p>
          <p>
            Worldwide meeting information is attributed to{" "}
            <ExternalLink href={GLOBAL_DIRECTORY_SOURCE.directoryUrl}>
              Recovery Dharma Global
            </ExternalLink>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
