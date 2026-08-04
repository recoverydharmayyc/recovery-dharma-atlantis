import ButtonLink from "../components/ButtonLink";
import { ROUTE_PATHS } from "../config/site";

export default function NotFound() {
  return (
    <div className="page-shell not-found-route">
      <section className="site-container not-found-layout" aria-labelledby="not-found-heading">
        <div className="page-intro">
          <p className="page-intro__eyebrow">Page not found · 404</p>
          <h1 id="not-found-heading">This path ends here.</h1>
          <p className="page-intro__lede">
            The address may be incomplete, or the page may have moved. The community guide begins
            again at the home page.
          </p>
        </div>
        <div className="not-found-action surface-ledger">
          <p className="section-label">Chart note · 404</p>
          <p>The requested route is not part of this community field guide.</p>
          <ButtonLink to={ROUTE_PATHS.home}>Return home</ButtonLink>
        </div>
      </section>
    </div>
  );
}
