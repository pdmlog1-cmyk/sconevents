'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { conf } from '@/lib/config';

type FaqCat = 'all' | 'event' | 'abstract' | 'register' | 'travel' | 'policy';

const FAQS: [FaqCat, string, React.ReactNode][] = [
  ['event',    'Who should attend this conference?',
    'The programme is built for university faculty, scientists, R&D and industry professionals, policy-makers, founders, and graduate / doctoral students looking to stay ahead of current research and emerging practice in the field.'],
  ['register', 'What is the process for completing my registration?',
    <>Open the <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link> page on this website, choose your participation mode and category, and submit the secure online form. Confirmation is instant and an official receipt follows within 2-4 business days. Early-bird pricing applies if you register before the published cut-off.</>],
  ['register', 'Is the hotel included in my registration fee?',
    'No — the hotel is not covered by the registration fee. You can optionally add a room at the negotiated rate inside the registration form, or arrange your own hotel independently. The official conference hotel will be confirmed once the venue is announced.'],
  ['register', 'Are group registration discounts available?',
    <>Yes. Group registration is available for three or more delegates from the same institution, with a reduced rate applied to every registration in the group. Request the group code via the <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link> page.</>],
  ['register', 'Does the conference cover any of my registration, travel or hotel expenses?',
    'The organisers do not provide financial support for registration, travel, flights, meals or hotel stays. Early-bird pricing and group registration are the available ways to reduce your overall cost.'],
  ['travel',   'Will the organisers issue official documentation to support my visa application?',
    'Yes — but only for registered, paid-up participants. Once your payment is confirmed, a personalised invitation letter is issued within 3-5 business days, which you can submit alongside your visa application.'],
  ['abstract', 'Is there a limit on how many abstracts one author can submit?',
    'Each author may submit up to two abstracts, in oral, poster, or a combination of both formats.'],
  ['abstract', 'When will I know if my abstract has been accepted?',
    'Authors are notified of acceptance within 2-4 business days of submitting their abstract. Decisions are sent by email from the event coordinator.'],
  ['abstract', 'What are the requirements for poster presentations, including the size?',
    'Posters must fit within a display area of 1 metre wide × 1 metre tall (portrait). Presenters prepare their poster in advance and bring it to the venue themselves — the organisers cannot receive posters by mail, arrange printing, or transport posters on a presenter’s behalf, and there are no on-site facilities for printing or composing posters.'],
  ['abstract', 'Are joint or team presentations permitted for early-career delegates?',
    'Yes. Groups of 3-4 early-career researchers can present a shared piece of work. One member registers in the speaker category and the rest register at the standard delegate or student rate.'],
  ['policy',   'Can my registration be transferred to someone else or rolled over to a later edition if my plans change?',
    'Yes. You may either nominate a colleague to take your place at no extra charge, or carry the registration forward to a future edition of the conference. Both options are available right up to the opening day at the venue.'],
  ['policy',   'What is the cancellation and refund policy?',
    <>
      <ul style={{ margin: '0 0 14px 18px', padding: 0, lineHeight: 1.6 }}>
        <li>All cancellation requests must be submitted in writing to the conference secretariat.</li>
        <li>Cancellations received <strong>more than 90 days before</strong> the conference start date are eligible for a full refund, less a <strong>$100 administrative fee</strong>.</li>
        <li>Cancellations received <strong>within 90 days</strong> of the start date are non-refundable; however, the registration may be transferred to a future edition of the conference.</li>
        <li>Transfer requests are accepted up until the conference start date — no transfers can be processed once the event has begun.</li>
        <li>Approved refunds are issued during the second week following the close of the conference.</li>
      </ul>
      <span><strong>Force majeure:</strong> This policy does not apply if the event is postponed, rescheduled or disrupted by circumstances outside the organisers&apos; control — including natural disasters, acts of God, fire, epidemics or pandemics, government regulations or travel restrictions, civil unrest, war, terrorism, industrial action or strikes, sabotage, cyber-attacks, power outages, or communication failures. In such cases, all registration and hotel fees are automatically transferred to the rescheduled event or a future edition of the conference. Refunds are not issued under these circumstances.</span>
    </>],
  ['event',    'How will I be kept informed about programme updates and schedule changes?',
    'All announcements, programme revisions and important reminders are posted to this website and shared on our official social channels. Registered delegates also receive direct email updates from the secretariat as the event approaches.'],
];

export default function FaqsClient() {
  const [cat, setCat] = useState<FaqCat>('all');
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const q = qs.get('cat') as FaqCat | null;
    if (q && ['event', 'abstract', 'register', 'travel', 'policy'].includes(q)) setCat(q);
  }, []);

  const filtered = FAQS.map((f, i) => ({ f, i })).filter(({ f }) => cat === 'all' || f[0] === cat);

  return (
    <section className="section">
      <div className="container">
        <div className="page-layout">
          <main className="page-main">
            <div className="page-intro">
              <div className="eyebrow"><span className="eyebrow-num">01</span> Quick Answers</div>
              <h2>Got a question?</h2>
              <p>Answers to what delegates, presenters and sponsors ask most often. Can&apos;t find what you&apos;re looking for? The organizing team is an email away.</p>
            </div>

            <div className="faq-filters">
              {(['all', 'event', 'abstract', 'register', 'travel', 'policy'] as FaqCat[]).map(c => (
                <button
                  key={c}
                  className={`faq-filter${cat === c ? ' active' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c === 'all' ? 'All' : c === 'event' ? 'Event & Venue' : c === 'abstract' ? 'Submissions' : c === 'register' ? 'Registration' : c === 'travel' ? 'Travel & Visa' : 'Policies'}
                </button>
              ))}
            </div>

            <div className="faq-list">
              {filtered.map(({ f, i }) => (
                <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
                  <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                    <span className="faq-cat">{f[0].charAt(0).toUpperCase() + f[0].slice(1)}</span>
                    {f[1]}
                    <i className="fas fa-plus" />
                  </div>
                  <div className="faq-a"><div style={{ paddingTop: 14 }}>{f[2]}</div></div>
                </div>
              ))}
            </div>
          </main>

          <aside className="page-aside">
            <div className="aside-card aside-card-dark">
              <div className="aside-label"><span className="pulse" /> Still need help?</div>
              <h4 className="aside-title" style={{ color: '#fff' }}>Talk to the team</h4>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.55, marginBottom: 16 }}>
                Average response time under 24 hours on working days.
              </p>
              <a href={`mailto:${conf.email}`} className="btn btn-primary btn-block">
                <i className="fas fa-envelope" /> Email the organizers
              </a>
            </div>

            <div className="aside-card">
              <div className="aside-label">Related</div>
              <h4 className="aside-title">Before you register</h4>
              <ul className="aside-checklist">
                <li><i className="fas fa-check" /> <Link href="/guidelines">Author guidelines</Link></li>
                <li><i className="fas fa-check" /> <Link href="/venue">Venue &amp; travel</Link></li>
                <li><i className="fas fa-check" /> <Link href="/terms-of-use">Terms of Use</Link></li>
                <li><i className="fas fa-check" /> <Link href="/privacy-policy">Privacy Policy</Link></li>
              </ul>
            </div>

            <div className="aside-card aside-card-accent">
              <div className="aside-label">Ready?</div>
              <h4 className="aside-title">Submit or register</h4>
              <p>Answers not blockers. Take the next step.</p>
              <div className="aside-contact">
                <Link href="/call-for-abstract-submission"><i className="fas fa-file-signature" /> Submit Abstract</Link>
                <Link href="/register"><i className="fas fa-ticket-alt" /> Register Now</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
