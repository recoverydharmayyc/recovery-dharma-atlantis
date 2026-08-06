import { useEffect, useMemo, useState } from "react";
import { GLOBAL_DIRECTORY_SOURCE } from "../config/externalSources";
import { MEETINGS_PAGE_CONTENT } from "../content/meetings";
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
import type { SanitizedGlobalMeeting } from "../meetings/globalDirectorySanitizer";
import { formatMeetingStartLabel, getMeetingStatus } from "../meetings/localMeetings";
import ExternalLink from "./ExternalLink";
import StatusLabel from "./StatusLabel";

type GlobalViewStatus = "loading" | "live" | "cached" | "empty" | "unavailable" | "error";

function scheduleAfterLocalPaint(callback: () => void): () => void {
  let workFrameId = 0;
  const paintFrameId = window.requestAnimationFrame(() => {
    workFrameId = window.requestAnimationFrame(callback);
  });
  return () => {
    window.cancelAnimationFrame(paintFrameId);
    if (workFrameId) window.cancelAnimationFrame(workFrameId);
  };
}

function useGlobalMeetings(now: Date) {
  const [records, setRecords] = useState<SanitizedGlobalMeeting[]>([]);
  const [status, setStatus] = useState<GlobalViewStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const cancelScheduledWork = scheduleAfterLocalPaint(() => {
      const cached = readFreshGlobalMeetingCache();
      if (cancelled) return;
      if (cached) setRecords(cached);

      void loadGlobalMeetingDirectory({ signal: controller.signal, cachedMeetings: cached }).then(
        (result) => {
          if (cancelled) return;
          setRecords(result.meetings);
          setStatus(result.status);
        },
      );
    });

    return () => {
      cancelled = true;
      cancelScheduledWork();
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

export default function GlobalDirectorySection({ now }: { now: Date }) {
  const { meetings, status } = useGlobalMeetings(now);

  return (
    <section className="global-directory" aria-labelledby="global-heading">
      <div className="site-container global-directory__inner">
        <div className="global-directory__header">
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
            data-global-state={status}
          >
            {getGlobalStatusMessage(status, meetings.length > 0)}
          </p>
        </div>

        {meetings.length > 0 && (
          <ol className="global-meeting-list">
            {meetings.map((meeting) => (
              <GlobalMeeting
                key={`${meeting.id}-${meeting.startsAt.toISOString()}`}
                meeting={meeting}
                now={now}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
