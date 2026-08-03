import { NavLink } from "react-router-dom";
import { NEWCOMERS_CONTENT } from "../content/newcomers";
import "./About.css";
import "./Newcomers.css";

export default function Newcomers() {
  return (
    <section className="container about-page newcomers-page">
      <header className="about-hero">
        <p className="about-eyebrow">{NEWCOMERS_CONTENT.hero.eyebrow}</p>
        <h1 className="about-title">{NEWCOMERS_CONTENT.hero.title}</h1>
        <p className="about-lede">{NEWCOMERS_CONTENT.hero.lede}</p>
      </header>

      <div className="about-main">
        {NEWCOMERS_CONTENT.sections.map((section, index) => (
          <section
            className={`about-section ${index === 0 ? "about-section--local" : "about-section--program"}`}
            key={section.title}
          >
            <p className="about-section-kicker">{section.kicker}</p>
            <h2>{section.title}</h2>
            <div className="about-copy">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="about-meeting-rhythm" aria-labelledby="newcomers-rhythm-title">
        <div className="about-rhythm-heading">
          <p className="about-section-kicker">{NEWCOMERS_CONTENT.rhythm.kicker}</p>
          <h2 id="newcomers-rhythm-title">{NEWCOMERS_CONTENT.rhythm.title}</h2>
        </div>
        <div className="about-rhythm-body">
          <ol className="about-steps">
            {NEWCOMERS_CONTENT.rhythm.steps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
          <NavLink className="about-meetings-link" to="/meetings">
            {NEWCOMERS_CONTENT.rhythm.actionLabel}
          </NavLink>
        </div>
      </section>
    </section>
  );
}
