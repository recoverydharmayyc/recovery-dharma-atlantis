import { NavLink } from "react-router-dom";
import { ROUTE_PATHS } from "../config/site";

export default function NotFound() {
  return (
    <section className="container about-page" aria-labelledby="not-found-heading">
      <header className="about-hero">
        <p className="about-eyebrow">Page not found</p>
        <h1 className="about-title" id="not-found-heading">
          This path does not lead to a page.
        </h1>
        <p className="about-lede">The address may be incomplete or the page may have moved.</p>
        <NavLink className="about-meetings-link" to={ROUTE_PATHS.home}>
          Return home
        </NavLink>
      </header>
    </section>
  );
}
