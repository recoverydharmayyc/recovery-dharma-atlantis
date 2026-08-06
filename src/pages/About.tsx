import { NavLink } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { ROUTE_PATHS } from "../config/site";
import { ABOUT_CONTENT } from "../content/about";

export default function About() {
  return (
    <div className="page-shell editorial-page about-page">
      <div className="site-container about-layout">
        <PageIntro
          eyebrow={ABOUT_CONTENT.hero.eyebrow}
          title={ABOUT_CONTENT.hero.title}
          lede={ABOUT_CONTENT.hero.lede}
          headingId="about-heading"
        />

        <div className="editorial-page__body about-page__body">
          <div className="about-principles">
            {ABOUT_CONTENT.sections.map((section) => (
              <section className="prose-section info-surface" key={section.title}>
                <div>
                  <p className="section-label">{section.kicker}</p>
                  <h2>{section.title}</h2>
                </div>
                <div className="prose-section__copy">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.actionRow && (
                    <NavLink className="text-link" to={section.actionRow.secondaryHref}>
                      {section.actionRow.secondaryLabel}
                    </NavLink>
                  )}
                </div>
              </section>
            ))}
          </div>

          <section className="about-rhythm ocean-surface">
            <div className="about-rhythm__heading">
              <p className="section-label">{ABOUT_CONTENT.rhythm.kicker}</p>
              <h2>{ABOUT_CONTENT.rhythm.title}</h2>
            </div>
            <ol className="about-rhythm__steps">
              {ABOUT_CONTENT.rhythm.steps.map((step, index) => (
                <li key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <NavLink className="text-link" to={ROUTE_PATHS.meetings}>
              {ABOUT_CONTENT.rhythm.actionLabel}
            </NavLink>
          </section>
        </div>
      </div>
    </div>
  );
}
