import { NavLink } from "react-router-dom";
import { ABOUT_CONTENT } from "../content/about";
import "./About.css";

export default function About() {
  return (
    <section className="container about-page">
      <header className="about-hero">
        <p className="about-eyebrow">{ABOUT_CONTENT.hero.eyebrow}</p>
        <h1 className="about-title">{ABOUT_CONTENT.hero.title}</h1>
        <p className="about-lede">{ABOUT_CONTENT.hero.lede}</p>
      </header>

      <div className="about-main">
        {ABOUT_CONTENT.sections.map((section, index) => (
          <section
            className={`about-section ${index === 0 ? "about-section--local" : "about-section--program"}`}
            key={section.title}
          >
            <p className="about-section-kicker">{section.kicker}</p>
            <h2>{section.title}</h2>
            <div className="about-copy">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {section.actionRow && (
              <div className="about-link-row">
                <NavLink className="about-resource-link" to={section.actionRow.secondaryHref}>
                  {section.actionRow.secondaryLabel}
                </NavLink>
              </div>
            )}
          </section>
        ))}
      </div>

      <section className="about-meeting-rhythm" aria-labelledby="about-meeting-rhythm-title">
        <div className="about-rhythm-heading">
          <p className="about-section-kicker">{ABOUT_CONTENT.rhythm.kicker}</p>
          <h2 id="about-meeting-rhythm-title">{ABOUT_CONTENT.rhythm.title}</h2>
        </div>
        <div className="about-rhythm-body">
          <ol className="about-steps">
            {ABOUT_CONTENT.rhythm.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <NavLink className="about-meetings-link" to="/meetings">
            {ABOUT_CONTENT.rhythm.actionLabel}
          </NavLink>
        </div>
      </section>
    </section>
  );
}
