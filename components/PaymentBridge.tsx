'use client';

import { useEffect } from 'react';

type Order = {
  order_id: string;
  name: string;
  email: string;
  category: string;
  addons: string | string[];
  coupon: string;
  total: number;
  currency: string;
};

export default function PaymentBridge({ order }: { order: Order }) {
  // Demo: redirect after 2.5s. In production, server would create a Stripe/Razorpay session.
  useEffect(() => {
    const url = `https://checkout.stripe.com/pay/${encodeURIComponent(order.order_id)}`;
    const t = setTimeout(() => { window.location.href = url; }, 2500);
    return () => clearTimeout(t);
  }, [order.order_id]);

  const addons = Array.isArray(order.addons) ? order.addons.join(', ') : order.addons;

  return (
    <div style={{ background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 560, width: '100%', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 40, textAlign: 'center', boxShadow: 'var(--shadow-card)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 20px' }}>
          <i className="fas fa-lock" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--ink)', marginBottom: 8 }}>Redirecting to secure payment…</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Do not close this window. You&apos;ll be taken to our encrypted payment gateway.</p>
        <div style={{ width: 52, height: 52, border: '3px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '20px auto' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 20, margin: '24px 0', textAlign: 'left' }}>
          {([
            ['Order ID', order.order_id],
            ['Attendee', order.name || '—'],
            ['Email', order.email || '—'],
            ['Category', order.category.charAt(0).toUpperCase() + order.category.slice(1)],
            ...(addons ? [['Add-ons', addons]] : []),
            ...(order.coupon ? [['Coupon', order.coupon]] : []),
            ['Total', `$${order.total.toLocaleString()} ${order.currency}`],
          ] as [string, string][]).map(([lbl, val], i, arr) => (
            <div key={lbl} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: i === arr.length - 1 ? '14px 0 0' : '8px 0',
              fontSize: i === arr.length - 1 ? '1.1rem' : 14,
              borderBottom: i === arr.length - 1 ? 'none' : '1px dashed var(--line)',
              fontWeight: i === arr.length - 1 ? 700 : 400,
              color: i === arr.length - 1 ? 'var(--accent)' : 'inherit',
            }}>
              <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{lbl}</span>
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          <i className="fas fa-shield-alt" style={{ color: 'var(--accent)', marginRight: 4 }} />
          Processed via 256-bit SSL &middot; PCI-compliant gateway
        </p>
      </div>
    </div>
  );
}
