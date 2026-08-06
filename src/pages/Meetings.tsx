import { useEffect, useMemo, useState } from "react";
import ExternalLink from "../components/ExternalLink";
import GlobalDirectorySection from "../components/GlobalDirectorySection";
import PageIntro from "../components/PageIntro";
import StatusLabel from "../components/StatusLabel";
import { MEETINGS_PAGE_CONTENT } from "../content/meetings";
import useMinuteClock from "../hooks/useMinuteClock";
import {
  buildLocalMeetings,
  formatMeetingStartLabel,
  getMeetingStatus,
  getNearestLocalMeeting,
  type LocalMeetingItem,
} from "../meetings/localMeetings";

function LocalScheduleRow({
  item,
  index,
  now,
  selected,
  nearest,
  onSelect,
}: {
  item: LocalMeetingItem;
  index: number;
  now: Date;
  selected: boolean;
  nearest: boolean;
  onSelect: () => void;
}) {
  return (
    <li className={`schedule-row${selected ? " schedule-row--selected" : ""}`}>
      <span className="schedule-row__index">{String(index + 1).padStart(2, "0")}</span>
      <div className="schedule-row__body">
        <div className="schedule-row__heading">
          <h3>{item.title}</h3>
          {nearest && <StatusLabel status={getMeetingStatus(item.startsAt, now)} />}
        </div>
        <p className="schedule-row__summary">
          {item.dayLabel} · {item.timeLabel}
          <br />
          {item.venueLabel}
        </p>
        <button
          className="schedule-row__select"
          type="button"
          aria-pressed={selected}
          aria-controls="selected-meeting-details"
          onClick={onSelect}
        >
          {selected ? "Details shown" : "View details"}
        </button>
      </div>
    </li>
  );
}

function LocalMeetingDetail({ item, now }: { item: LocalMeetingItem; now: Date }) {
  return (
    <article
      className="meeting-detail"
      id="selected-meeting-details"
      aria-labelledby={`meeting-${item.id}`}
    >
      <div className="meeting-detail__copy">
        <div className="meeting-detail__statusline">
          <StatusLabel status={getMeetingStatus(item.startsAt, now)} />
          <p className="meeting-detail__timing">
            {formatMeetingStartLabel(item.startsAt, now, item.timeZone)}
          </p>
        </div>
        <h3 id={`meeting-${item.id}`}>{item.title}</h3>
        <p className="meeting-detail__description">{item.description}</p>
        {item.publicLink && (
          <ExternalLink href={item.publicLink}>Open verified meeting link</ExternalLink>
        )}
      </div>
      <dl className="meeting-detail__facts">
        <div>
          <dt>Schedule</dt>
          <dd>
            {item.dayLabel}, {item.timeLabel} · {item.timeZoneLabel}
          </dd>
        </div>
        <div>
          <dt>Place</dt>
          <dd>
            {item.eyebrow} · {item.venueLabel}
          </dd>
        </div>
        {(item.newcomerNote || item.registrationNote) && (
          <div>
            <dt>Welcome</dt>
            <dd>{[item.newcomerNote, item.registrationNote].filter(Boolean).join(" · ")}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

export default function Meetings() {
  const now = useMinuteClock();
  const localMeetings = useMemo(() => buildLocalMeetings(now), [now]);
  const nearestMeeting = getNearestLocalMeeting(localMeetings);
  const [selectedId, setSelectedId] = useState(() => nearestMeeting?.id ?? null);

  useEffect(() => {
    if (!localMeetings.some((meeting) => meeting.id === selectedId))
      setSelectedId(nearestMeeting?.id ?? null);
  }, [localMeetings, nearestMeeting?.id, selectedId]);

  const selectedMeeting =
    localMeetings.find((meeting) => meeting.id === selectedId) || nearestMeeting;

  return (
    <div className="page-shell meetings-page">
      <div className="site-container meetings-local-stage">
        <PageIntro
          eyebrow={MEETINGS_PAGE_CONTENT.hero.kicker}
          title={MEETINGS_PAGE_CONTENT.hero.title}
          lede={MEETINGS_PAGE_CONTENT.hero.lede}
          headingId="meetings-heading"
        />

        <section className="local-schedule" id="local-schedule" aria-labelledby="local-heading">
          <div className="section-heading">
            <p className="section-label">{MEETINGS_PAGE_CONTENT.local.kicker}</p>
            <h2 id="local-heading">{MEETINGS_PAGE_CONTENT.local.title}</h2>
          </div>

          <ol className="schedule-ledger">
            {localMeetings.map((meeting, index) => (
              <LocalScheduleRow
                key={meeting.id}
                item={meeting}
                index={index}
                now={now}
                selected={meeting.id === selectedMeeting?.id}
                nearest={meeting.id === nearestMeeting?.id}
                onSelect={() => setSelectedId(meeting.id)}
              />
            ))}
          </ol>

          <p className="meetings-qualification">{MEETINGS_PAGE_CONTENT.local.qualification}</p>
        </section>

        {selectedMeeting && <LocalMeetingDetail item={selectedMeeting} now={now} />}
      </div>
      <GlobalDirectorySection now={now} />
    </div>
  );
}
