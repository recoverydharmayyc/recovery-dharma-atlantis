import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import { SITE } from "../content/site";
import ExternalLink from "./ExternalLink";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-utility">
        <p>{SITE.footerNotice}</p>
        <p className="footer-utility__context">
          <span>{SITE.independenceNotice}</span>
          <span>
            Worldwide listings are attributed to{" "}
            <ExternalLink href={GLOBAL_DIRECTORY_SOURCE.directoryUrl}>
              Recovery Dharma Global
            </ExternalLink>
            .
          </span>
        </p>
      </div>
    </footer>
  );
}
