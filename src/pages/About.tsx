import { NavLink } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { ROUTE_PATHS } from "../config/site";
import { ABOUT_CONTENT } from "../content/about";

export default function About() {
  return (
    <div className="page-shell editorial-page">
      <div className="site-container">
        <PageIntro
          eyebrow={ABOUT_CONTENT.hero.eyebrow}
          title={ABOUT_CONTENT.hero.title}
          lede={ABOUT_CONTENT.hero.lede}
          headingId="about-heading"
        />

        <div className="editorial-page__body">
          {ABOUT_CONTENT.sections.map((section) => (
            <section
              className="editorial-grid editorial-grid--split prose-section"
              key={section.title}
            >
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

          <section className="editorial-grid editorial-grid--split prose-section">
            <div>
              <p className="section-label">{ABOUT_CONTENT.rhythm.kicker}</p>
              <h2>{ABOUT_CONTENT.rhythm.title}</h2>
            </div>
            <div>
              <ol className="field-guide">
                {ABOUT_CONTENT.rhythm.steps.map((step, index) => (
                  <li key={step}>
                    <span className="field-guide__number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
              <NavLink className="text-link" to={ROUTE_PATHS.meetings}>
                {ABOUT_CONTENT.rhythm.actionLabel}
              </NavLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
