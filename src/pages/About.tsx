import PageIntro from "../components/PageIntro";
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
          <p className="about-overview">{ABOUT_CONTENT.overview}</p>

          <section className="about-autonomy subtle-surface" aria-labelledby="autonomy-heading">
            <h2 id="autonomy-heading">{ABOUT_CONTENT.autonomy.title}</h2>
            <p>{ABOUT_CONTENT.autonomy.body}</p>
          </section>

          <div className="about-areas">
            {ABOUT_CONTENT.areas.map((area) => (
              <section className="about-area" key={area.title}>
                <h2>{area.title}</h2>
                <p>{area.body}</p>
              </section>
            ))}
          </div>

          <p className="about-limitation">{ABOUT_CONTENT.limitation}</p>
        </div>
      </div>
    </div>
  );
}
