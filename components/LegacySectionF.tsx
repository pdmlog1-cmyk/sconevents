import { LegacyMarquee } from './legacy-shared';

export default function LegacySectionF() {
  return (
    <section className="section legacy-section legacy-F">
      <div className="container">
        <div className="lF-grid">
          <div className="lF-text">
            <span className="lF-eyebrow">Our Heritage</span>
            <h2>Not our first<br /><em>congress.</em></h2>
            <div className="lF-rule" />
            <p className="lF-quote">
              &ldquo;The latest chapter in a long-running tradition of curating high-impact medical and scientific gatherings &mdash; year after year, in cities around the world.&rdquo;
            </p>
            <div className="lF-meta">
              <span>10+ years</span>
              <span>·</span>
              <span>Multi-disciplinary</span>
              <span>·</span>
              <span>Global network</span>
            </div>
          </div>

          <div className="lF-photos">
            <figure className="lF-photo lF-photo-1">
              <img src="/assets/legacy/awards.jpg" alt="Recognition awards from past conferences" />
            </figure>
            <figure className="lF-photo lF-photo-2">
              <img src="/assets/legacy/audience.jpg" alt="Engaged audience" />
            </figure>
            <figure className="lF-photo lF-photo-3">
              <img src="/assets/legacy/speaker.jpg" alt="Speaker at the podium" />
            </figure>
          </div>
        </div>
      </div>

      <LegacyMarquee />
    </section>
  );
}
