import { NavLink } from "react-router-dom";
import { ROUTE_PATHS } from "../config/site";
import { HOME_CONTENT } from "../content/home";
import "./Home.css";

export default function Home() {
  return (
    <section className="container home-page">
      <div className="home-hero">
        <div className="home-copy">
          <p className="home-eyebrow">{HOME_CONTENT.hero.eyebrow}</p>
          <h1 className="home-title">{HOME_CONTENT.hero.heroText}</h1>
          <p className="home-sub">{HOME_CONTENT.hero.subText}</p>
          <p className="home-blurb">{HOME_CONTENT.hero.blurb}</p>
          <div className="home-cta-row">
            <NavLink to={ROUTE_PATHS.meetings} className="home-button home-button--primary">
              {HOME_CONTENT.primaryButtonLabel}
            </NavLink>
            <NavLink to={ROUTE_PATHS.newcomers} className="home-button home-button--secondary">
              {HOME_CONTENT.secondaryButtonLabel}
            </NavLink>
          </div>
        </div>

        <aside className="home-orientation" aria-label="New visitor information">
          <p className="home-panel-kicker">{HOME_CONTENT.orientation.kicker}</p>
          <h2>{HOME_CONTENT.orientation.heading}</h2>
          <ul className="home-orientation-list">
            {HOME_CONTENT.orientation.features.map((feature) => (
              <li key={feature.kicker}>
                <span>{feature.kicker}</span>
                <p>{feature.description}</p>
              </li>
            ))}
          </ul>
          <NavLink to={ROUTE_PATHS.newcomers} className="home-text-link">
            {HOME_CONTENT.orientation.detailsLinkLabel}
          </NavLink>
        </aside>
      </div>
    </section>
  );
}
