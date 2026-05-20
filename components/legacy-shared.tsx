export const LEGACY_MARQUEE_IMAGES: [string, string][] = [
  ['/assets/legacy/poster-hero.jpg', 'Researchers in conversation around a poster'],
  ['/assets/legacy/smile.jpg', 'Delegate at registration'],
  ['/assets/legacy/poster1.jpg', 'Researchers reviewing a poster'],
  ['/assets/legacy/audience2.jpg', 'Engaged audience taking notes'],
  ['/assets/legacy/discussion2.jpg', 'Open-floor discussion'],
  ['/assets/legacy/podium.jpg', 'Invited speaker at the podium'],
  ['/assets/legacy/poster2.jpg', 'Poster session in progress'],
  ['/assets/legacy/question.jpg', 'Delegate raising a question'],
  ['/assets/legacy/portrait.jpg', 'Delegate during a session'],
  ['/assets/legacy/registration2.jpg', 'Conference materials at registration'],
  ['/assets/legacy/posterview.jpg', 'Reviewing scientific posters'],
  ['/assets/legacy/checkin.jpg', 'Delegate check-in desk'],
  ['/assets/legacy/registration.jpg', 'Pickup of conference kits'],
];

export function LegacyMarquee() {
  return (
    <div className="legacy-marquee" aria-label="More moments from past events">
      <div className="legacy-marquee-track">
        {[...LEGACY_MARQUEE_IMAGES, ...LEGACY_MARQUEE_IMAGES].map(([src, alt], i) => (
          <figure key={`${src}-${i}`} className="legacy-marquee-item">
            <img src={src} alt={alt} loading="lazy" />
          </figure>
        ))}
      </div>
    </div>
  );
}

export function LegacyStats() {
  return (
    <div className="legacy-stats">
      <div className="legacy-stat"><strong>10+</strong><span>Years of programmes</span></div>
      <div className="legacy-stat"><strong>Multi</strong><span>Medical disciplines</span></div>
      <div className="legacy-stat"><strong>Global</strong><span>Speaker network</span></div>
      <div className="legacy-stat"><strong>Trusted</strong><span>By academia &amp; industry</span></div>
    </div>
  );
}
