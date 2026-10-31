import { notFound } from 'next/navigation';
import Script from 'next/script';
import { getConferenceConfig } from '@/lib/getConfig';
import { getConferenceMeta } from '@/lib/conferences';
import { applyLiveDates, getLiveDates } from '@/lib/liveDates';
import LandingClient from './LandingClient';
import NeuroLanding from './NeuroLanding';

interface PageProps {
  params: Promise<{ conference: string }>;
}

/* Rendered per request, not prerendered: the abstract and early-bird dates come
   from the main site (lib/liveDates.ts) and must change without a deploy. */
export const dynamic = 'force-dynamic';

// Map conference slug prefix to logo filename
function getLogoName(slug: string): string {
  const prefix = slug.split('-')[0].toLowerCase();
  const validLogos = [
    'addiction', 'biotechnology', 'cardiology', 'food', 'gastroenterology',
    'neurology', 'obesity', 'pharmaceutical', 'physicalmedicine', 'surgery'
  ];
  return validLogos.includes(prefix) ? prefix : 'cardiology';
}

export async function generateMetadata({ params }: PageProps) {
  const { conference } = await params;
  const conf = await getConferenceConfig(conference);
  if (!conf) return { title: 'Conference Not Found' };

  const logoName = getLogoName(conference);

  return {
    title: `Register · ${conf.short}`,
    description: `${conf.theme_primary} — ${conf.dates}, ${conf.country}. Reserve your seat at ${conf.short}.`,
    robots: { index: false, follow: true },
    icons: {
      icon: `/logos/${logoName}.svg`,
      shortcut: `/logos/${logoName}.svg`,
      apple: `/logos/${logoName}.svg`,
    },
  };
}

export default async function ConferencePage({ params }: PageProps) {
  const { conference } = await params;
  const baseConf = await getConferenceConfig(conference);
  const meta = getConferenceMeta(conference);

  if (!baseConf || !meta) {
    notFound();
  }

  const conf = applyLiveDates(baseConf, await getLiveDates(conference, meta.mainSiteUrl));

  const gtagId = meta.gtagId;
  const logoName = getLogoName(conference);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
        strategy="afterInteractive"
      />
      <Script id={`gtag-init-${gtagId}`} strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gtagId}');
      `}</Script>
      {/* conference.json picks the layout: "v2" is the redesigned page, and
          anything else keeps the original LandingClient the other pages use. */}
      {conf.landing_style === 'v2' ? (
        <NeuroLanding
          conf={conf}
          mainSiteUrl={meta.mainSiteUrl}
          theme={meta.theme}
          slug={conference}
          logoName={logoName}
        />
      ) : (
        <LandingClient conf={conf} mainSiteUrl={meta.mainSiteUrl} theme={meta.theme} slug={conference} />
      )}
    </>
  );
}
