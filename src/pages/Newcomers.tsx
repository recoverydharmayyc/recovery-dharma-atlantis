import ButtonLink from "../components/ButtonLink";
import PageIntro from "../components/PageIntro";
import { ROUTE_PATHS } from "../config/site";
import { NEWCOMERS_CONTENT } from "../content/newcomers";

export default function Newcomers() {
  return (
    <div className="page-shell editorial-page newcomers-page">
      <div className="site-container newcomers-layout">
        <PageIntro
          eyebrow={NEWCOMERS_CONTENT.hero.eyebrow}
          title={NEWCOMERS_CONTENT.hero.title}
          lede={NEWCOMERS_CONTENT.hero.lede}
          headingId="newcomers-heading"
        />

        <div className="newcomers-guide-wrap">
          <ol className="field-guide newcomer-guide" aria-label="A four-step first-visit guide">
            {NEWCOMERS_CONTENT.steps.map((step, index) => (
              <li key={step.title}>
                <span className="field-guide__number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{step.title}</h2>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="newcomer-closing subtle-surface">
            <div>
              <strong>Before attending</strong>
              <p>{NEWCOMERS_CONTENT.qualification}</p>
            </div>
            <ButtonLink to={ROUTE_PATHS.meetings}>{NEWCOMERS_CONTENT.actionLabel}</ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
