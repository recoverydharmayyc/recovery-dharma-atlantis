import { useMemo } from "react";
import ButtonLink from "../components/ButtonLink";
import StatusLabel from "../components/StatusLabel";
import { ROUTE_PATHS } from "../config/site";
import { HOME_CONTENT } from "../content/home";
import useMinuteClock from "../hooks/useMinuteClock";
import {
  buildLocalMeetings,
  getMeetingStatus,
  getNearestLocalMeeting,
} from "../meetings/localMeetings";

export default function Home() {
  const now = useMinuteClock();
  const nextMeeting = useMemo(() => getNearestLocalMeeting(buildLocalMeetings(now)), [now]);

  return (
    <>
      <div className="page-shell page-shell--home home-page">
        <div className="site-container home-stage">
          <section className="home-hero" aria-labelledby="home-heading">
            <div className="home-hero__copy">
              <p className="page-intro__eyebrow">{HOME_CONTENT.hero.eyebrow}</p>
              <h1 className="home-hero__title" id="home-heading">
                {HOME_CONTENT.hero.heroText}
              </h1>
              <p className="home-hero__summary">{HOME_CONTENT.hero.subText}</p>
              <p className="home-hero__body">{HOME_CONTENT.hero.blurb}</p>
              <div className="button-row home-hero__actions">
                <ButtonLink to={ROUTE_PATHS.meetings}>{HOME_CONTENT.primaryButtonLabel}</ButtonLink>
                <ButtonLink to={ROUTE_PATHS.newcomers} variant="secondary">
                  {HOME_CONTENT.secondaryButtonLabel}
                </ButtonLink>
              </div>
            </div>

            {nextMeeting && (
              <aside className="next-ledger" aria-labelledby="next-gathering-heading">
                <div className="next-ledger__header">
                  <p className="next-ledger__label" id="next-gathering-heading">
                    Next gathering
                  </p>
                  <StatusLabel status={getMeetingStatus(nextMeeting.startsAt, now)} />
                </div>
                <div className="next-ledger__entry">
                  <p className="next-ledger__day">{nextMeeting.dayLabel.slice(0, 3)}</p>
                  <div>
                    <p className="next-ledger__time">{nextMeeting.timeLabel}</p>
                    <h2 className="next-ledger__title">{nextMeeting.title}</h2>
                    <p className="next-ledger__meta">
                      {nextMeeting.venueLabel}
                      {nextMeeting.newcomerNote && ` · ${nextMeeting.newcomerNote}`}
                      {nextMeeting.registrationNote && ` · ${nextMeeting.registrationNote}`}
                    </p>
                    <ButtonLink to={ROUTE_PATHS.meetings} variant="secondary">
                      View all meetings
                    </ButtonLink>
                  </div>
                </div>
              </aside>
            )}

            <section className="home-practice" aria-labelledby="home-practice-heading">
              <div className="section-heading">
                <p className="section-label">{HOME_CONTENT.practice.kicker}</p>
                <h2 id="home-practice-heading">{HOME_CONTENT.practice.heading}</h2>
              </div>
              <ol className="practice-sequence">
                {HOME_CONTENT.practice.features.map((feature, index) => (
                  <li key={feature.title}>
                    <span className="practice-sequence__number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </section>
        </div>
      </div>

      <section className="home-invitation-band">
        <div className="site-container newcomer-invitation">
          <div className="newcomer-invitation__copy">
            <p className="section-label">{HOME_CONTENT.invitation.kicker}</p>
            <h2>{HOME_CONTENT.invitation.heading}</h2>
            <p>{HOME_CONTENT.invitation.body}</p>
          </div>
          <ButtonLink to={ROUTE_PATHS.newcomers}>{HOME_CONTENT.invitation.actionLabel}</ButtonLink>
        </div>
      </section>
    </>
  );
}
