import ButtonLink from "../components/ButtonLink";
import PageIntro from "../components/PageIntro";
import { ROUTE_PATHS } from "../config/site";
import { CONNECT_CONTENT } from "../content/connect";

export default function Connect() {
  return (
    <div className="page-shell editorial-page">
      <div className="site-container">
        <PageIntro
          eyebrow={CONNECT_CONTENT.hero.eyebrow}
          title={CONNECT_CONTENT.hero.title}
          lede={CONNECT_CONTENT.hero.lede}
          headingId="connect-heading"
        />

        <section className="connect-empty" aria-labelledby="connect-empty-heading">
          <h2 id="connect-empty-heading">{CONNECT_CONTENT.emptyState.heading}</h2>
          <p className="connect-empty__copy">{CONNECT_CONTENT.emptyState.body}</p>
          <div className="button-row">
            <ButtonLink to={ROUTE_PATHS.meetings}>
              {CONNECT_CONTENT.emptyState.meetingsAction}
            </ButtonLink>
            <ButtonLink to={ROUTE_PATHS.newcomers} variant="secondary">
              {CONNECT_CONTENT.emptyState.newcomersAction}
            </ButtonLink>
          </div>
          <p className="connect-note">{CONNECT_CONTENT.emptyState.note}</p>
        </section>
      </div>
    </div>
  );
}
