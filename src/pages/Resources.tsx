import ExternalLink from "../components/ExternalLink";
import PageIntro from "../components/PageIntro";
import { RESOURCES_CONTENT } from "../content/resources";

export default function Resources() {
  const { hero, items } = RESOURCES_CONTENT;

  return (
    <div className="page-shell editorial-page resources-page">
      <div className="site-container resources-layout">
        <PageIntro
          eyebrow={hero.eyebrow}
          title={hero.title}
          lede={hero.lede}
          headingId="resources-heading"
        />

        <section className="resource-chapters" aria-label="Verified Recovery Dharma resources">
          <ol className="resource-index">
            {items.map((resource, index) => (
              <li className="resource-index__item" key={resource.title}>
                <span className="resource-index__number">{String(index + 1).padStart(2, "0")}</span>
                <div className="resource-index__copy">
                  <ExternalLink className="resource-index__title" href={resource.href}>
                    {resource.title}
                  </ExternalLink>
                  <p className="resource-index__description">{resource.description}</p>
                  <p className="resource-index__source">Source: {resource.source}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
