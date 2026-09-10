'use client';

/* Copy of Sconconferences/neurology/components/HomepageFaqs.tsx.
   The existing HomepageFaqs.tsx here is kept untouched (other pages use it);
   this one differs only in that its links are absolute <a> tags to the
   canonical main site, since this deployment has no /faqs or /terms-of-use
   route of its own. Question and answer text is verbatim from the main site,
   including the current refund clause. */

import { useState } from 'react';

export default function HomepageFaqsLanding({ baseUrl }: { baseUrl: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const linkStyle = { color: 'var(--accent)', fontWeight: 600 } as const;

  const faqs: [string, React.ReactNode][] = [
    [
      'Who should attend this conference?',
      <>The programme is built for university faculty, scientists, R&amp;D and industry professionals, policy-makers, founders, and graduate / doctoral students looking to stay ahead of current research and emerging practice in the field.</>
    ],
    [
      'What is the process for completing my registration?',
      <>Open the <a href={`${baseUrl}/register`} style={linkStyle}>Register</a> page on this website, choose your participation mode and category, and submit the secure online form. Confirmation is instant and an official receipt follows within 2-4 business days.</>
    ],
    [
      'Is there a limit on how many abstracts one author can submit?',
      <>Each author may submit up to two abstracts, in oral, poster, or a combination of both formats.</>
    ],
    [
      'Will the organisers issue official documentation to support my visa application?',
      <>Yes — but only for registered, paid-up participants. Once your payment is confirmed, a personalised invitation letter is issued within 3-5 business days, which you can submit alongside your visa application.</>
    ],
    [
      'What is the cancellation and refund policy?',
      <>Registration fees are generally non-refundable. Where a written request is received more than 60 calendar days before the Event, the Organizer may consider substitution, transfer to another edition, a time-limited registration credit, or in exceptional circumstances a partial refund after deducting non-recoverable costs. During the final 60 days, a monetary refund cannot ordinarily be provided, though substitution or a credit toward a future Event may be considered at the Organizer&apos;s discretion. Approved refunds are ordinarily initiated within 15 business days. See the <a href={`${baseUrl}/terms-of-use`} style={linkStyle}>Terms &amp; Conditions</a> for the complete policy.</>
    ],
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="section-head-text">
            <div className="eyebrow"><span className="eyebrow-num">09</span> Quick Answers</div>
            <h2>Common questions.</h2>
          </div>
          <div className="section-head-text">
            <p>
              Everything you need to know before you register. For more, visit the{' '}
              <a href={`${baseUrl}/faqs`} style={linkStyle}>full FAQs</a>.
            </p>
          </div>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
              <div className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                {q} <i className="fas fa-plus" />
              </div>
              <div className="faq-a"><p style={{ paddingTop: 14 }}>{a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
