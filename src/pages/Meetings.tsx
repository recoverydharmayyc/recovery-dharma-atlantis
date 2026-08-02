import { MEETINGS_CONTENT } from "../content/meetings";
import { MEETING } from "../content/site";
import "./Meetings.css";

export default function Meetings() {
  return (
    <section className="container meetings-page" aria-labelledby="meetings-heading">
      <section className="meeting-section meeting-section--local">
        <div className="meeting-section-heading">
          <p className="meeting-section-kicker">{MEETINGS_CONTENT.hero.kicker}</p>
          <h1 id="meetings-heading">{MEETINGS_CONTENT.hero.title}</h1>
          <p>{MEETINGS_CONTENT.hero.lede}</p>
        </div>

        <article className="meeting-card meeting-card--local" aria-labelledby="sample-meeting-heading">
          <div className="meeting-card-topline">
            <span className="meeting-status-pill meeting-status-pill--early">Fictional sample</span>
            <span className="meeting-card-time">{MEETING.time}</span>
          </div>
          <p className="meeting-card-eyebrow">{MEETINGS_CONTENT.meeting.eyebrow}</p>
          <h2 id="sample-meeting-heading">{MEETINGS_CONTENT.meeting.title}</h2>
          <p className="meeting-card-description">{MEETINGS_CONTENT.meeting.description}</p>
          <div className="meeting-card-meta" aria-label="Fictional meeting details">
            {MEETINGS_CONTENT.meeting.metaLines.map((line) => <span key={line}>{line}</span>)}
          </div>
        </article>
      </section>

      <section className="meeting-section meeting-section--global" aria-labelledby="meeting-verification-heading">
        <div className="meeting-section-heading">
          <p className="meeting-section-kicker">{MEETINGS_CONTENT.note.kicker}</p>
          <h2 id="meeting-verification-heading">{MEETINGS_CONTENT.note.title}</h2>
          <p>{MEETINGS_CONTENT.note.body}</p>
        </div>
      </section>
    </section>
  );
}
