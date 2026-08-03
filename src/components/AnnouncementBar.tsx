import { NavLink } from "react-router-dom";
import type { ActiveAnnouncement } from "../announcements/announcementTiming";

export default function AnnouncementBar({ announcement }: { announcement: ActiveAnnouncement }) {
  return (
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
  );
}
