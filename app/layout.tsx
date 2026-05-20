import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Source_Sans_3, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SCON Events',
  description: 'Scientific Conference Organizers Network - Conference Landing Pages',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://js.hcaptcha.com" crossOrigin="" />
        <link rel="preconnect" href="https://newassets.hcaptcha.com" crossOrigin="" />
        <link rel="preconnect" href="https://hcaptcha.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://imgs.hcaptcha.com" />
        <link
          rel="preload"
          as="script"
          href="https://js.hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad"
          crossOrigin=""
        />
      </head>
      <body>
        {children}
        <Script
          id="hcaptcha-api"
          src="https://js.hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad"
          strategy="afterInteractive"
        />
        <Script id="hcaptcha-bootstrap" strategy="afterInteractive">{`
          window.hcaptchaOnLoad = function () {
            if (!window.hcaptcha) return;
            document.querySelectorAll('.h-captcha:not([data-hcaptcha-widget-id])').forEach(function (el) {
              try { window.hcaptcha.render(el); } catch (e) { /* already rendered or invalid */ }
            });
          };
          document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'visible' && window.hcaptchaOnLoad) window.hcaptchaOnLoad();
          });
        `}</Script>
      </body>
    </html>
  );
}
