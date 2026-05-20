import { LegacyMarquee } from './legacy-shared';

export default function LegacySectionE() {
  return (
    <section className="section legacy-section legacy-E">
      <div className="lE-eyebrow-wrap">
        <span className="lE-eyebrow">Conference Archive</span>
      </div>

      <figure className="lE-feature">
        <img src="/assets/legacy/awards.jpg" alt="Recognition awards from past conferences" />
      </figure>

      <div className="container">
        <div className="lE-caption">
          <h2>Not our first congress.<br /><em>Just our newest one.</em></h2>
          <p>A long-running tradition of curating high-impact medical and scientific gatherings &mdash; year after year, in cities around the world.</p>
        </div>
      </div>

      <LegacyMarquee />
    </section>
  );
}
