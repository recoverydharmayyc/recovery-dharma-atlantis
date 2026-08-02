import { CONNECT_CONTENT } from "../content/connect";
import "./Connect.css";

export default function Connect() {
  return (
    <section className="container connect-page">
      <header className="connect-hero">
        <p className="connect-eyebrow">{CONNECT_CONTENT.hero.eyebrow}</p>
        <h1 className="connect-title">{CONNECT_CONTENT.hero.title}</h1>
        <p className="connect-lede">{CONNECT_CONTENT.hero.lede}</p>
      </header>

      <section className="connect-channels" aria-label="Contact information for adopters">
        {CONNECT_CONTENT.channels.map((channel) => (
          <article className="connect-channel" key={channel.title}>
            <div className="connect-channel-copy">
              <p className="connect-channel-kicker">{channel.kicker}</p>
              <h2>{channel.title}</h2>
              <p>{channel.description}</p>
            </div>
            <div className="connect-channel-action">
              <p className="connect-action-note">{channel.action}</p>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}
