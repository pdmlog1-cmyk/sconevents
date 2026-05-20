import { LegacyMarquee } from './legacy-shared';

export default function LegacySectionH() {
  return (
    <section className="section legacy-section legacy-H">
      <div className="container">
        <div className="lH-grid">
          <div className="lH-text">
            <span className="lH-eyebrow">Our Heritage</span>
            <h2>Not our first <em>congress.</em><br />Just our newest one.</h2>
            <p>The latest chapter in a long-running tradition of curating high-impact medical and scientific gatherings &mdash; year after year, in cities around the world.</p>
          </div>

          <figure className="lH-hero">
            <img src="/assets/legacy/awards.jpg" alt="Recognition awards" />
          </figure>

          <figure className="lH-p1"><img src="/assets/legacy/audience.jpg" alt="Engaged audience" /></figure>
          <figure className="lH-p2"><img src="/assets/legacy/speaker.jpg" alt="Speaker at the podium" /></figure>
          <figure className="lH-p3"><img src="/assets/legacy/discussion.jpg" alt="Q&A discussion" /></figure>
          <figure className="lH-p4"><img src="/assets/legacy/checkin.jpg" alt="Delegate check-in" /></figure>
          <figure className="lH-p5"><img src="/assets/legacy/poster1.jpg" alt="Poster session" /></figure>
          <figure className="lH-p6"><img src="/assets/legacy/networking.jpg" alt="Networking" /></figure>
        </div>
      </div>

      <LegacyMarquee />
    </section>
  );
}
