import { LegacyMarquee, LegacyStats } from './legacy-shared';

export default function LegacySectionB() {
  return (
    <section className="section legacy-section legacy-B">
      <div className="container">
        <div className="lB-grid">
          <div className="lB-text">
            <div className="eyebrow"><span className="eyebrow-num">·</span> Our Heritage</div>
            <h2>Not our first congress.<br />Just our newest one.</h2>
            <p className="lead">This congress is the latest chapter in a long-running tradition of curating high-impact medical and scientific gatherings.</p>
            <p>Our organising team has hosted international conferences across multiple disciplines &mdash; bringing clinicians, researchers and industry together year after year, in cities around the world.</p>
            <div className="lB-mini-stats">
              <div><strong>10+</strong><span>Years</span></div>
              <div><strong>Multi</strong><span>Disciplines</span></div>
              <div><strong>Global</strong><span>Network</span></div>
            </div>
          </div>
          <div className="lB-photo">
            <img src="/assets/legacy/podium.jpg" alt="Speaker at a past conference" />
          </div>
        </div>
      </div>

      <LegacyMarquee />
    </section>
  );
}
