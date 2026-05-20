import { LegacyMarquee, LegacyStats } from './legacy-shared';

export default function LegacySectionA() {
  return (
    <section className="section legacy-section legacy-A">
      <div className="lA-banner">
        <img src="/assets/legacy/awards.jpg" alt="Recognition awards from past conferences" />
        <div className="lA-overlay">
          <div className="container">
            <div className="lA-overlay-inner">
              <div className="eyebrow eyebrow-on-dark"><span className="eyebrow-num">·</span> Our Heritage</div>
              <h2>Not our first congress.<br />Just our newest one.</h2>
              <p>This congress is the latest chapter in a long-running tradition of curating high-impact medical and scientific gatherings &mdash; bringing clinicians, researchers and industry together year after year, in cities around the world.</p>
            </div>
          </div>
        </div>
      </div>

      <LegacyMarquee />

      <div className="container">
        <LegacyStats />
      </div>
    </section>
  );
}
