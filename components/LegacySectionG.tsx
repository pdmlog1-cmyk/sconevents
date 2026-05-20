import { LegacyMarquee } from './legacy-shared';

export default function LegacySectionG() {
  return (
    <section className="section legacy-section legacy-G">
      <div className="container">
        <div className="lG-grid">
          <div className="lG-text">
            <span className="lG-eyebrow">Our Heritage</span>
            <h2>Not our first <em>congress.</em><br />Just our newest one.</h2>
            <p>The latest chapter in a long-running tradition of curating high-impact medical and scientific gatherings.</p>
          </div>

          <figure className="lG-hero">
            <img src="/assets/legacy/awards.jpg" alt="Recognition awards" />
          </figure>

          <div className="lG-stats">
            <div><strong>10+</strong><span>Years</span></div>
            <div><strong>Multi</strong><span>Disciplines</span></div>
            <div><strong>Global</strong><span>Network</span></div>
            <div><strong>Trusted</strong><span>By all</span></div>
          </div>

          <figure className="lG-p1"><img src="/assets/legacy/audience.jpg" alt="Engaged audience" /></figure>
          <figure className="lG-p2"><img src="/assets/legacy/speaker.jpg" alt="Speaker at the podium" /></figure>
          <figure className="lG-p3"><img src="/assets/legacy/poster1.jpg" alt="Poster session" /></figure>
          <figure className="lG-p4"><img src="/assets/legacy/networking.jpg" alt="Networking" /></figure>
        </div>
      </div>

      <LegacyMarquee />
    </section>
  );
}
