import { LegacyMarquee } from './legacy-shared';

export default function LegacySectionC() {
  return (
    <section className="section legacy-section legacy-C">
      <div className="container">
        <div className="lC-head">
          <div className="eyebrow"><span className="eyebrow-num">·</span> Our Heritage</div>
          <h2>Not our first congress.<br />Just our newest one.</h2>
          <p>The latest chapter in a long-running tradition of curating high-impact medical and scientific gatherings &mdash; year after year, across multiple disciplines, in cities around the world.</p>
        </div>

        <div className="lC-frame">
          <figure className="lC-accent lC-accent-left">
            <img src="/assets/legacy/audience.jpg" alt="Engaged audience at a past conference" />
          </figure>

          <div className="lC-stats">
            <div className="lC-stat">
              <strong>10<span className="lC-plus">+</span></strong>
              <span>Years of curated programmes</span>
            </div>
            <div className="lC-stat">
              <strong>Multi</strong>
              <span>Medical &amp; scientific disciplines</span>
            </div>
            <div className="lC-stat">
              <strong>Global</strong>
              <span>Speaker &amp; delegate network</span>
            </div>
            <div className="lC-stat">
              <strong>Trusted</strong>
              <span>By academia &amp; industry</span>
            </div>
          </div>

          <figure className="lC-accent lC-accent-right">
            <img src="/assets/legacy/networking.jpg" alt="Networking moment at a past event" />
          </figure>
        </div>
      </div>

      <LegacyMarquee />
    </section>
  );
}
