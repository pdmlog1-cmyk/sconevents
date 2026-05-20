import { LegacyMarquee } from './legacy-shared';

export default function LegacySectionI() {
  return (
    <section className="section legacy-section legacy-I">
      <div className="container">
        <div className="lI-grid">
          <div className="lI-text">
            <span className="lI-eyebrow">Our Heritage</span>
            <h2>Not our first <em>congress.</em><br />Just our newest one.</h2>
            <p>The latest chapter in a long-running tradition of curating high-impact medical and scientific gatherings.</p>
          </div>

          <figure className="lI-hero">
            <img src="/assets/legacy/awards.jpg" alt="Recognition awards" />
          </figure>

          <figure className="lI-tall">
            <img src="/assets/legacy/portrait.jpg" alt="Delegate portrait" />
          </figure>

          <div className="lI-stats">
            <div><strong>10+</strong><span>Years</span></div>
            <div><strong>Multi</strong><span>Disciplines</span></div>
            <div><strong>Global</strong><span>Network</span></div>
          </div>

          <figure className="lI-p1"><img src="/assets/legacy/audience.jpg" alt="Engaged audience" /></figure>
          <figure className="lI-p2"><img src="/assets/legacy/speaker.jpg" alt="Speaker" /></figure>
          <figure className="lI-p3"><img src="/assets/legacy/poster1.jpg" alt="Poster session" /></figure>
          <figure className="lI-p4"><img src="/assets/legacy/networking.jpg" alt="Networking" /></figure>
          <figure className="lI-p5"><img src="/assets/legacy/discussion.jpg" alt="Discussion" /></figure>
        </div>
      </div>

      <LegacyMarquee />
    </section>
  );
}
