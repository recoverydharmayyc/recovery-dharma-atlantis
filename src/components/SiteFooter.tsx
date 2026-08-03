import { SITE } from "../content/site";

export default function SiteFooter() {
  return (
    <>
      <footer className="site-footer" aria-label="Fictional site status">
        <p>{SITE.footerNotice}</p>
      </footer>
      <img
        src="/forest_deep_two.png"
        alt=""
        className="footer"
        decoding="sync"
        fetchPriority="high"
        aria-hidden="true"
      />
    </>
  );
}
