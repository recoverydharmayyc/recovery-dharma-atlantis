import { NavLink } from "react-router-dom";
import type { ActiveAnnouncement } from "../announcements/announcementTiming";

export default function AnnouncementBar({ announcement }: { announcement: ActiveAnnouncement }) {
  return (
    <aside className="announcement-bulletin surface-clay" aria-label={announcement.ariaLabel}>
      <div className="site-container announcement-bulletin__inner">
        <span className="announcement-bulletin__marker">{announcement.label}</span>
        <span className="announcement-bulletin__message">
          <strong>{announcement.title}</strong>
          <span>{announcement.details}</span>
        </span>
        <NavLink className="announcement-bulletin__link" to={announcement.href}>
          View details →
        </NavLink>
      </div>
    </aside>
  );
}
