export default function PageIntro({
  eyebrow,
  title,
  lede,
  headingId,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  headingId: string;
}) {
  return (
    <header className="page-intro">
      <p className="page-intro__eyebrow">{eyebrow}</p>
      <h1 id={headingId}>{title}</h1>
      <p className="page-intro__lede">{lede}</p>
    </header>
  );
}
