import ButtonLink from "../components/ButtonLink";
import { ROUTE_PATHS } from "../config/site";

export default function NotFound() {
  return (
    <div className="page-shell not-found-route">
      <section className="site-container not-found-layout" aria-labelledby="not-found-heading">
        <div className="page-intro">
          <p className="page-intro__eyebrow">Page not found · 404</p>
          <h1 id="not-found-heading">Page not found</h1>
          <p className="page-intro__lede">The address does not match a page in this website.</p>
        </div>
        <div className="not-found-action info-surface">
          <p className="section-label">Available next step</p>
          <p>Use the home page to return to the community information.</p>
          <ButtonLink to={ROUTE_PATHS.home}>Go to home page</ButtonLink>
        </div>
      </section>
    </div>
  );
}
