import { useEffect, useMemo, useState } from "react";
import ExternalLink from "../components/ExternalLink";
import PageIntro from "../components/PageIntro";
import StatusLabel from "../components/StatusLabel";
import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import { MEETINGS_PAGE_CONTENT } from "../content/meetings";
import useMinuteClock from "../hooks/useMinuteClock";
import {
  loadGlobalMeetingDirectory,
  readFreshGlobalMeetingCache,
} from "../meetings/globalDirectory";
import {
  formatListedLocalTime,
  getGlobalMeetingOccurrences,
  selectGlobalPreviewMeetings,
  type GlobalMeetingOccurrence,
} from "../meetings/globalMeetingPreview";
import {
  buildLocalMeetings,
  formatMeetingStartLabel,
  getMeetingStatus,
  getNearestLocalMeeting,
  type LocalMeetingItem,
} from "../meetings/localMeetings";

type GlobalViewStatus = "loading" | "live" | "cached" | "empty" | "unavailable" | "error";

function useGlobalMeetings(now: Date) {
  const [initialCache] = useState(() => readFreshGlobalMeetingCache());
  const [records, setRecords] = useState(() => initialCache || []);
  const [status, setStatus] = useState<GlobalViewStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    loadGlobalMeetingDirectory({ signal: controller.signal }).then((result) => {
      if (cancelled) return;
      setRecords(result.meetings);
      setStatus(result.status);
    });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return {
    status,
    meetings: useMemo(
      () => selectGlobalPreviewMeetings(getGlobalMeetingOccurrences(records, now)),
      [records, now],
    ),
  };
}

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
        <StatusLabel status={getMeetingStatus(item.startsAt, now)} />
        <p className="meeting-detail__timing">
          {formatMeetingStartLabel(item.startsAt, now, item.timeZone)}
        </p>
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
            {item.dayLabel}, {item.timeLabel}
          </dd>
        </div>
        <div>
          <dt>Time zone</dt>
          <dd>{item.timeZoneLabel}</dd>
        </div>
        <div>
          <dt>Format and venue</dt>
          <dd>
            {item.eyebrow} · {item.venueLabel}
          </dd>
        </div>
        {item.newcomerNote && (
          <div>
            <dt>Newcomers</dt>
            <dd>{item.newcomerNote}</dd>
          </div>
        )}
        {item.registrationNote && (
          <div>
            <dt>Registration</dt>
            <dd>{item.registrationNote}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}

function GlobalMeeting({ meeting, now }: { meeting: GlobalMeetingOccurrence; now: Date }) {
  return (
    <li className="global-meeting">
      <div className="global-meeting__topline">
        <StatusLabel status={getMeetingStatus(meeting.startsAt, now)} />
        <span className="global-meeting__time">
          {formatMeetingStartLabel(meeting.startsAt, now, meeting.timeZone)}
        </span>
      </div>
      <p className="global-meeting__region">{meeting.region}</p>
      <h3>{meeting.name}</h3>
      <p className="global-meeting__time">{formatListedLocalTime(meeting)}</p>
      <div className="global-meeting__actions">
        <ExternalLink className="button-link button-link--primary" href={meeting.conferenceUrl}>
          Open meeting
        </ExternalLink>
        <ExternalLink href={meeting.sourceUrl}>View source details</ExternalLink>
      </div>
    </li>
  );
}

function getGlobalStatusMessage(status: GlobalViewStatus, hasMeetings: boolean): string {
  switch (status) {
    case "loading":
      return hasMeetings
        ? "Refreshing recently cached listings."
        : "Loading a small preview from the public directory.";
    case "live":
      return "Current public preview loaded.";
    case "cached":
      return "Showing recently cached listings while the live directory is unavailable.";
    case "empty":
      return "No suitable open online previews are available right now.";
    case "unavailable":
      return "The live directory is not available in this browser. Use the full directory link.";
    case "error":
      return "The live directory could not be reached. Use the full directory link.";
  }
}

export default function Meetings() {
  const now = useMinuteClock();
  const localMeetings = useMemo(() => buildLocalMeetings(now), [now]);
  const nearestMeeting = getNearestLocalMeeting(localMeetings);
  const [selectedId, setSelectedId] = useState(() => nearestMeeting?.id ?? null);
  const { meetings: globalMeetings, status: globalStatus } = useGlobalMeetings(now);

  useEffect(() => {
    if (!localMeetings.some((meeting) => meeting.id === selectedId))
      setSelectedId(nearestMeeting?.id ?? null);
  }, [localMeetings, nearestMeeting?.id, selectedId]);

  const selectedMeeting =
    localMeetings.find((meeting) => meeting.id === selectedId) || nearestMeeting;

  return (
    <div className="page-shell meetings-page">
      <div className="site-container">
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

          {selectedMeeting && <LocalMeetingDetail item={selectedMeeting} now={now} />}
          <p className="meetings-qualification">{MEETINGS_PAGE_CONTENT.local.qualification}</p>
        </section>

        <section className="global-directory" aria-labelledby="global-heading">
          <div className="global-directory__intro">
            <p className="section-label">{MEETINGS_PAGE_CONTENT.global.kicker}</p>
            <h2 id="global-heading">{MEETINGS_PAGE_CONTENT.global.title}</h2>
            <p>{MEETINGS_PAGE_CONTENT.global.disclosure}</p>
            <ExternalLink href={GLOBAL_DIRECTORY_SOURCE.directoryUrl}>
              {MEETINGS_PAGE_CONTENT.global.directoryLabel}
            </ExternalLink>
          </div>

          <p
            className="global-directory__status"
            aria-live="polite"
            aria-atomic="true"
            data-global-state={globalStatus}
          >
            {getGlobalStatusMessage(globalStatus, globalMeetings.length > 0)}
          </p>

          {globalMeetings.length > 0 && (
            <ol className="global-meeting-list">
              {globalMeetings.map((meeting) => (
                <GlobalMeeting
                  key={`${meeting.id}-${meeting.startsAt.toISOString()}`}
                  meeting={meeting}
                  now={now}
                />
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
