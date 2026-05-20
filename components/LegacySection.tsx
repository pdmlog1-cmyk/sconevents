const ROW_1: [string, string][] = [
  ['/assets/legacy/awards.jpg', 'Recognition awards'],
  ['/assets/legacy/audience.jpg', 'Engaged audience'],
  ['/assets/legacy/poster-hero.jpg', 'Researchers around a poster'],
  ['/assets/legacy/speaker.jpg', 'Speaker at the podium'],
  ['/assets/legacy/networking.jpg', 'Networking moment'],
  ['/assets/legacy/panel.jpg', 'Panel discussion'],
  ['/assets/legacy/audience3.jpg', 'Audience close-up'],
  ['/assets/legacy/applause.jpg', 'Delegate during a session'],
  ['/assets/legacy/networking2.jpg', 'Two delegates networking'],
  ['/assets/legacy/panel2.jpg', 'On-stage panel discussion'],
];

const ROW_2: [string, string][] = [
  ['/assets/legacy/podium.jpg', 'Speaker at the podium'],
  ['/assets/legacy/discussion.jpg', 'Q&A discussion'],
  ['/assets/legacy/registration.jpg', 'Conference registration'],
  ['/assets/legacy/smile.jpg', 'Delegate at registration'],
  ['/assets/legacy/question.jpg', 'Delegate raising a question'],
  ['/assets/legacy/audience2.jpg', 'Attendees taking notes'],
  ['/assets/legacy/lunch.jpg', 'Networking lunch'],
  ['/assets/legacy/signin2.jpg', 'Sign-in moment at registration'],
];

const ROW_3: [string, string][] = [
  ['/assets/legacy/checkin.jpg', 'Delegate check-in'],
  ['/assets/legacy/poster2.jpg', 'Poster session in progress'],
  ['/assets/legacy/posterview.jpg', 'Reviewing posters'],
  ['/assets/legacy/registration2.jpg', 'Conference materials'],
  ['/assets/legacy/discussion2.jpg', 'Open-floor discussion'],
  ['/assets/legacy/chat.jpg', 'Networking conversation'],
  ['/assets/legacy/signin.jpg', 'Delegate signing in'],
  ['/assets/legacy/tabletalk.jpg', 'Three delegates in conversation'],
  ['/assets/legacy/badging.jpg', 'Picking up registration materials'],
];

function MarqueeRow({ items, direction, className }: { items: [string, string][]; direction: 'left' | 'right'; className: string }) {
  const dirClass = direction === 'right' ? 'lwm-track-reverse' : '';
  return (
    <div className={`lwm-row ${className}`}>
      <div className={`lwm-track ${dirClass}`}>
        {[...items, ...items, ...items].map(([src, alt], i) => (
          <figure key={`${src}-${i}`} className="lwm-tile">
            <img src={src} alt={alt} loading="lazy" />
          </figure>
        ))}
      </div>
    </div>
  );
}

export default function LegacySection() {
  return (
    <section className="section legacy-section legacy-wall-motion legacy-section-no-head">
      <div className="lwm-stack" aria-label="Moments from past conferences">
        <MarqueeRow items={ROW_1} direction="left"  className="lwm-row-1" />
        <MarqueeRow items={ROW_2} direction="right" className="lwm-row-2" />
        <MarqueeRow items={ROW_3} direction="left"  className="lwm-row-3" />
      </div>

      <div className="container">
        <div className="legacy-stats">
          <div className="legacy-stat"><strong>7+</strong><span>Years of programmes</span></div>
          <div className="legacy-stat"><strong>Multi</strong><span>Medical disciplines</span></div>
          <div className="legacy-stat"><strong>Global</strong><span>Speaker network</span></div>
          <div className="legacy-stat"><strong>Trusted</strong><span>By academia &amp; industry</span></div>
        </div>
      </div>
    </section>
  );
}
