import { useEffect, useMemo, useState } from "react";
import { MEETINGS_PAGE_CONTENT } from "../content/meetings";
import {
  GLOBAL_MEETINGS_URL,
  type GlobalMeetingCardItem,
  type LocalMeetingCardItem,
  buildLocalMeetings,
  formatListedLocalTime,
  formatMeetingStartLabel,
  getGlobalMeetingOccurrences,
  getMeetingStatus,
  getNearestLocalMeeting,
  selectGlobalPreviewMeetings,
} from "../meetings/meetingData";
import {
  loadGlobalMeetingDirectory,
  readFreshGlobalMeetingCache,
} from "../meetings/globalDirectory";
import { MINUTE_MS } from "../meetings/time";
import "./Meetings.css";

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), MINUTE_MS);
    return () => window.clearInterval(intervalId);
  }, []);
  return now;
}

function useGlobalMeetings(now: Date) {
  const [records, setRecords] = useState(() => readFreshGlobalMeetingCache() || []);
  const [status, setStatus] = useState<"loading" | "ready" | "cached" | "fallback">(() =>
    readFreshGlobalMeetingCache() ? "cached" : "loading",
  );

  useEffect(() => {
    let cancelled = false;
    loadGlobalMeetingDirectory().then((result) => {
      if (cancelled) return;
      setRecords(result.meetings);
      setStatus(result.status);
    });
    return () => {
      cancelled = true;
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

function MeetingStatusPill({ startsAt, now }: { startsAt: Date; now: Date }) {
  const status = getMeetingStatus(startsAt, now);
  return (
    <span className={"meeting-status-pill meeting-status-pill--" + status.tone}>
      {status.label}
    </span>
  );
}

function LocalMeetingCard({ item, now }: { item: LocalMeetingCardItem; now: Date }) {
  return (
    <article className="meeting-card meeting-card--local" aria-labelledby={"meeting-" + item.id}>
      <div className="meeting-card-topline">
        <MeetingStatusPill startsAt={item.startsAt} now={now} />
        <span className="meeting-card-time">
          {formatMeetingStartLabel(item.startsAt, now, item.timeZone)}
        </span>
      </div>
      <p className="meeting-card-eyebrow">{item.eyebrow}</p>
      <h3 id={"meeting-" + item.id}>{item.title}</h3>
      <p className="meeting-card-description">{item.description}</p>
      <div className="meeting-card-meta" aria-label="Fictional meeting details">
        {item.metaLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
      {item.publicLink && (
        <div className="meeting-card-actions">
          <a
            className="meeting-button meeting-button--maps"
            href={item.publicLink}
            target="_blank"
            rel="noreferrer"
          >
            Open verified link
          </a>
        </div>
      )}
    </article>
  );
}

function GlobalMeetingCard({ meeting, now }: { meeting: GlobalMeetingCardItem; now: Date }) {
  return (
    <article className="meeting-card meeting-card--global">
      <div className="meeting-card-topline">
        <MeetingStatusPill startsAt={meeting.startsAt} now={now} />
        <span className="meeting-card-time">
          {formatMeetingStartLabel(meeting.startsAt, now, meeting.timeZone)}
        </span>
      </div>
      <p className="meeting-card-eyebrow">{meeting.region}</p>
      <h3>{meeting.name}</h3>
      <div className="meeting-card-meta" aria-label="Listed meeting details">
        <span>{formatListedLocalTime(meeting)}</span>
      </div>
      <div className="meeting-card-actions">
        <a
          className="meeting-button meeting-button--global"
          href={meeting.conferenceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open meeting
        </a>
        <a
          className="meeting-details-link"
          href={meeting.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Details
        </a>
      </div>
    </article>
  );
}

export default function Meetings() {
  const now = useNow();
  const localMeetings = useMemo(() => buildLocalMeetings(now), [now]);
  const { meetings: globalMeetings, status: globalStatus } = useGlobalMeetings(now);
  const [selectedLocalMeetingId, setSelectedLocalMeetingId] = useState<string | null>(null);

  useEffect(() => {
    if (!localMeetings.some((meeting) => meeting.id === selectedLocalMeetingId)) {
      setSelectedLocalMeetingId(getNearestLocalMeeting(localMeetings)?.id || null);
    }
  }, [localMeetings, selectedLocalMeetingId]);

  const selectedLocalMeeting =
    localMeetings.find((meeting) => meeting.id === selectedLocalMeetingId) ||
    getNearestLocalMeeting(localMeetings);

  return (
    <section className="container meetings-page" aria-labelledby="meetings-heading">
      <section className="meeting-section meeting-section--local">
        <div className="meeting-section-heading">
          <p className="meeting-section-kicker">{MEETINGS_PAGE_CONTENT.hero.kicker}</p>
          <h1 id="meetings-heading">{MEETINGS_PAGE_CONTENT.hero.title}</h1>
          <p>{MEETINGS_PAGE_CONTENT.hero.lede}</p>
        </div>

        {localMeetings.length > 1 && (
          <div className="meeting-day-selector" aria-label="Choose a fictional local meeting">
            {localMeetings.map((meeting) => (
              <button
                key={meeting.id}
                className={
                  "meeting-day-tab" +
                  (meeting.id === selectedLocalMeeting?.id ? " meeting-day-tab--active" : "")
                }
                type="button"
                aria-pressed={meeting.id === selectedLocalMeeting?.id}
                onClick={() => setSelectedLocalMeetingId(meeting.id)}
              >
                {meeting.tabLabel}
              </button>
            ))}
          </div>
        )}
        {selectedLocalMeeting && <LocalMeetingCard item={selectedLocalMeeting} now={now} />}
      </section>

      <section
        className="meeting-section meeting-section--global"
        aria-labelledby="global-meetings-heading"
      >
        <div className="meeting-section-heading">
          <p className="meeting-section-kicker">{MEETINGS_PAGE_CONTENT.global.kicker}</p>
          <h2 id="global-meetings-heading">{MEETINGS_PAGE_CONTENT.global.title}</h2>
          <p>{MEETINGS_PAGE_CONTENT.global.disclosure}</p>
          <a
            className="meeting-directory-link"
            href={GLOBAL_MEETINGS_URL}
            target="_blank"
            rel="noreferrer"
          >
            {MEETINGS_PAGE_CONTENT.global.directoryLabel}
          </a>
        </div>

        {globalStatus === "cached" && (
          <p className="meeting-source-status">
            Showing recently cached listings while the live directory is unavailable.
          </p>
        )}
        {globalStatus === "loading" && (
          <p className="meeting-source-status">
            Loading a small preview from the public directory.
          </p>
        )}
        {globalStatus === "fallback" && (
          <p className="meeting-source-status">
            The live directory is unavailable right now. Use the full directory link above.
          </p>
        )}
        {globalMeetings.length > 0 && (
          <div className="meeting-card-list">
            {globalMeetings.map((meeting) => (
              <GlobalMeetingCard
                key={meeting.id + meeting.startsAt.toISOString()}
                meeting={meeting}
                now={now}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
