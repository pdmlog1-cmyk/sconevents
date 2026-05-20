'use client';

import { useState } from 'react';
import Link from 'next/link';
import { conf } from '@/lib/config';

export default function HomepageFaqs() {
  const [open, setOpen] = useState<number | null>(0);

  const faqs: [string, React.ReactNode][] = [
    [
      'Who should attend this conference?',
      <>The programme is built for university faculty, scientists, R&amp;D and industry professionals, policy-makers, founders, and graduate / doctoral students looking to stay ahead of current research and emerging practice in the field.</>
    ],
    [
      'What is the process for completing my registration?',
      <>Open the <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link> page on this website, choose your participation mode and category, and submit the secure online form. Confirmation is instant and an official receipt follows within 2-4 business days.</>
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
      <>Cancellations received more than 90 days before the conference start date are eligible for a full refund, less a $100 administrative fee. Cancellations within 90 days are non-refundable but may be transferred to a future edition. See the <Link href="/faqs" style={{ color: 'var(--accent)', fontWeight: 600 }}>full FAQs</Link> for the complete policy.</>
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
              <Link href="/faqs" style={{ color: 'var(--accent)', fontWeight: 600 }}>full FAQs</Link>.
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
