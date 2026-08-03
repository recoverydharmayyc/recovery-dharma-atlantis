import { NavLink } from "react-router-dom";
import { RESOURCES_CONTENT, type Resource } from "../content/resources";
import "./Resources.css";

function ResourceCard({
  resource,
  variant = "standard",
}: {
  resource: Resource;
  variant?: "standard" | "local" | "featured";
}) {
  const className = "resources-card resources-card--" + variant;
  const content = (
    <>
      <span className="resources-card-title">{resource.title}</span>
      <span className="resources-card-description">{resource.description}</span>
      <span className="resources-card-action">{resource.action}</span>
    </>
  );

  if (resource.internal && resource.href)
    return (
      <NavLink className={className} to={resource.href}>
        {content}
      </NavLink>
    );
  if (resource.href)
    return (
      <a className={className} href={resource.href} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  return <article className={className}>{content}</article>;
}

export default function Resources() {
  const { hero, sections } = RESOURCES_CONTENT;
  return (
    <section className="container resources-page" aria-labelledby="resources-heading">
      <header className="resources-hero">
        <p className="resources-eyebrow">{hero.eyebrow}</p>
        <h1 className="resources-title" id="resources-heading">
          {hero.title}
        </h1>
        <p className="resources-lede">{hero.lede}</p>
      </header>

      <section
        className="resources-section resources-section--local"
        aria-labelledby="local-heading"
      >
        <div className="resources-section-heading">
          <p className="resources-section-kicker">{sections.local.kicker}</p>
          <h2 id="local-heading">{sections.local.title}</h2>
        </div>
        <div className="resources-grid resources-grid--local">
          {sections.local.items.map((resource) => (
            <ResourceCard key={resource.title} resource={resource} variant="local" />
          ))}
        </div>
      </section>

      <section className="resources-section" aria-labelledby="core-heading">
        <div className="resources-section-heading">
          <p className="resources-section-kicker">{sections.core.kicker}</p>
          <h2 id="core-heading">{sections.core.title}</h2>
        </div>
        <div className="resources-feature-grid">
          {sections.core.items.map((resource) => (
            <ResourceCard key={resource.title} resource={resource} variant="featured" />
          ))}
        </div>
      </section>

      <section className="resources-section" aria-labelledby="practice-heading">
        <div className="resources-section-heading">
          <p className="resources-section-kicker">{sections.practice.kicker}</p>
          <h2 id="practice-heading">{sections.practice.title}</h2>
        </div>
        <div className="resources-list-grid">
          {sections.practice.items.map((resource) => (
            <ResourceCard key={resource.title} resource={resource} />
          ))}
        </div>
      </section>
    </section>
  );
}
