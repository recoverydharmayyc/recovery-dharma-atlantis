import { NavLink } from "react-router-dom";
import ExternalLink from "../components/ExternalLink";
import PageIntro from "../components/PageIntro";
import { RESOURCES_CONTENT, type Resource } from "../content/resources";

function ResourceTitle({ resource }: { resource: Resource }) {
  if (resource.internal && resource.href)
    return (
      <NavLink className="resource-index__title text-link" to={resource.href}>
        {resource.title}
      </NavLink>
    );
  if (resource.href)
    return (
      <ExternalLink className="resource-index__title external-link" href={resource.href}>
        {resource.title}
      </ExternalLink>
    );
  return <span className="resource-index__title">{resource.title}</span>;
}

export default function Resources() {
  const { hero, sections } = RESOURCES_CONTENT;
  const groups = [sections.local, sections.core, sections.practice];

  return (
    <div className="page-shell editorial-page resources-page">
      <div className="site-container resources-layout">
        <PageIntro
          eyebrow={hero.eyebrow}
          title={hero.title}
          lede={hero.lede}
          headingId="resources-heading"
        />

        <div className="resource-chapters">
          {groups.map((group) => (
            <section className="resource-group" key={group.title}>
              <div className="section-heading">
                <p className="section-label">{group.kicker}</p>
                <h2>{group.title}</h2>
              </div>
              <ol className="resource-index">
                {group.items.map((resource, index) => (
                  <li className="resource-index__item" key={resource.title}>
                    <span className="resource-index__number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="resource-index__copy">
                      <ResourceTitle resource={resource} />
                      <p className="resource-index__description">
                        {resource.description} Source: {resource.source}.
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
