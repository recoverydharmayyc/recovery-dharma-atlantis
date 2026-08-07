import { useMemo } from "react";
import ExternalLink from "../components/ExternalLink";
import GlobalDirectorySection from "../components/GlobalDirectorySection";
import PageIntro from "../components/PageIntro";
import StatusLabel from "../components/StatusLabel";
import { MEETINGS_PAGE_CONTENT } from "../content/meetings";
import useMinuteClock from "../hooks/useMinuteClock";
import {
  buildLocalMeetings,
  getNearestLocalMeeting,
  type LocalMeetingItem,
} from "../meetings/localMeetings";

function LocalMeetingCard({
  item,
  index,
  nearest,
}: {
  item: LocalMeetingItem;
  index: number;
  nearest: boolean;
}) {
  return (
    <li className={`local-meeting-card${item.kind === "temporary" ? " is-temporary" : ""}`}>
      <div className="local-meeting-card__topline">
        <span className="local-meeting-card__index">{String(index + 1).padStart(2, "0")}</span>
        {nearest && (
          <StatusLabel status={{ label: MEETINGS_PAGE_CONTENT.local.nextLabel, tone: "soon" }} />
        )}
      </div>

      <div className="local-meeting-card__heading">
        <h3>{item.title}</h3>
        <p>
          {item.dayLabel} · {item.timeLabel}
        </p>
        <p className="local-meeting-card__timezone">{item.timeZoneLabel}</p>
      </div>

      <dl className="local-meeting-card__facts">
        <div>
          <dt>Format</dt>
          <dd>{item.eyebrow}</dd>
        </div>
        <div>
          <dt>Venue</dt>
          <dd>{item.venueLabel}</dd>
        </div>
        {(item.newcomerNote || item.registrationNote) && (
          <div>
            <dt>Attendance</dt>
            <dd>{[item.newcomerNote, item.registrationNote].filter(Boolean).join(" · ")}</dd>
          </div>
        )}
      </dl>

      <p className="local-meeting-card__description">{item.description}</p>
      {item.publicLink && (
        <ExternalLink href={item.publicLink}>Open verified meeting link</ExternalLink>
      )}
    </li>
  );
}

export default function Meetings() {
  const now = useMinuteClock();
  const localMeetings = useMemo(() => buildLocalMeetings(now), [now]);
  const nearestMeeting = getNearestLocalMeeting(localMeetings);

  return (
    <div className="page-shell meetings-page">
      <div className="site-container meetings-local-stage">
        <div className="meetings-intro">
          <PageIntro
            eyebrow={MEETINGS_PAGE_CONTENT.hero.kicker}
            title={MEETINGS_PAGE_CONTENT.hero.title}
            lede={MEETINGS_PAGE_CONTENT.hero.lede}
            headingId="meetings-heading"
          />
          <p className="meetings-qualification">{MEETINGS_PAGE_CONTENT.local.qualification}</p>
        </div>

        <section className="local-schedule" id="local-schedule" aria-labelledby="local-heading">
          <div className="section-heading">
            <p className="section-label">{MEETINGS_PAGE_CONTENT.local.kicker}</p>
            <h2 id="local-heading">{MEETINGS_PAGE_CONTENT.local.title}</h2>
          </div>

          <ol className="local-meeting-list">
            {localMeetings.map((meeting, index) => (
              <LocalMeetingCard
                key={meeting.id}
                item={meeting}
                index={index}
                nearest={meeting.id === nearestMeeting?.id}
              />
            ))}
          </ol>
        </section>
      </div>
      <GlobalDirectorySection now={now} />
    </div>
  );
}
