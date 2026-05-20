import { LegacyMarquee } from './legacy-shared';

export default function LegacySectionD() {
  return (
    <section className="section legacy-section legacy-D">
      <div className="container">
        <div className="lD-masthead">
          <div className="lD-masthead-rule" />
          <div className="lD-masthead-row">
            <span className="lD-masthead-label">Volume IX &middot; Conference Archive</span>
            <span className="lD-masthead-years">2014 &mdash; 2024</span>
          </div>
          <div className="lD-masthead-rule" />
        </div>

        <div className="lD-head">
          <h2>Not our first congress.</h2>
          <p className="lD-deck"><em>Just our newest one</em> &mdash; the latest chapter in a long-running tradition of curating high-impact medical and scientific gatherings.</p>
        </div>

        <figure className="lD-feature">
          <img src="/assets/legacy/awards.jpg" alt="Recognition awards from past conferences" />
          <figcaption>
            <span className="lD-plate">Plate I.</span>
            <span className="lD-cap">Recognition awards prepared for honourees &mdash; from a recent edition of our global congress series.</span>
          </figcaption>
        </figure>

        <div className="lD-byline">
          <div><strong>10+</strong><span>Years of programmes</span></div>
          <div className="lD-byline-rule" />
          <div><strong>Multi</strong><span>Medical disciplines</span></div>
          <div className="lD-byline-rule" />
          <div><strong>Global</strong><span>Speaker network</span></div>
          <div className="lD-byline-rule" />
          <div><strong>Trusted</strong><span>By academia &amp; industry</span></div>
        </div>
      </div>

      <LegacyMarquee />
    </section>
  );
}
