import type { MeetingStatus } from "../meetings/localMeetings";

export default function StatusLabel({ status }: { status: MeetingStatus }) {
  return <span className={`status-label status-label--${status.tone}`}>{status.label}</span>;
}
