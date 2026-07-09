/* =============================================================================
   Conference Configuration (typed, JSON-driven)
   -----------------------------------------------------------------------------
   Content is loaded from JSON files under /data so non-developers can edit
   text, speakers, tracks and pricing without touching TypeScript.

   The exported `conf` object uses Addiction conference as default for
   backwards compatibility with components that import directly from here.
   For dynamic loading, use getConferenceConfig() from lib/getConfig.ts
   ============================================================================= */

// Default to Addiction conference for backwards compatibility
import conferenceJson from '@/data/addiction/conference.json';
import tracksJson from '@/data/addiction/tracks.json';
import speakersJson from '@/data/addiction/speakers.json';
import marketingJson from '@/data/addiction/marketing.json';

/* -------------------------------------------------------------------------- */
/*  Shared tuple types (unchanged — preserves API for existing components)    */
/* -------------------------------------------------------------------------- */

export type Speaker = [name: string, role: string, affiliation: string, photo: string];
export type Keynote = [name: string, talk: string, affiliation: string, photo: string];
export type OcmMember = [name: string, role: string, affiliation: string, photo: string];
export type Track = [title: string, description: string, details?: string, subtopics?: string[]];
export type Stat = [value: string, label: string];
export type WhyItem = [icon: string, title: string, description: string];
export type Testimonial = [quote: string, name: string, role: string];
export type KeyDate = [day: string, month: string, title: string, desc: string];
export type MarqueeItem = [label: string, icon: string];

export const trackSlug = (title: string) =>
  title.toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export interface ConferenceConfig {
  name: string; short: string; initials: string; year_suffix: string;
  tagline: string; edition: string; volume: string; issue: string;
  dateline: string; discipline: string; email: string; phone: string; base: string;
  hcaptcha_sitekey: string;
  theme_primary: string; theme_pillars: string[]; theme_blurb: string;
  hero_title_lead: string; hero_title_main: string; hero_title_year: string;
  hero_subtitle: string;
  hero_cta: { register_label: string; abstract_label: string; brochure_label: string };
  hero_card: { status: string; venue_label: string; venue_fallback: string; countdown_label: string };
  dates: string; dates_short: string; start_date_iso: string;
  city: string; country: string; venue: string; venue_tagline: string; venue_desc: string;
  venue_image: string; about_image: string; hero_image: string;
  abstract_deadline: string; early_bird_deadline: string;
  about_eyebrow: string; about_heading: string; about_lead: string; about_body: string;
  stats: Stat[]; tracks: Track[]; marquee_items: MarqueeItem[];
  why_eyebrow: string; why_heading: string; why_intro: string; why_attend: WhyItem[];
  testimonials_heading: string; testimonials_intro: string; testimonials: Testimonial[];
  key_dates: KeyDate[]; featured_speakers: Speaker[]; ocm: OcmMember[];
  keynotes: Keynote[]; speakers_all: Speaker[]; partners: string[];
  social: Record<string, string>;
}

/* -------------------------------------------------------------------------- */
/*  Adapters: object-form JSON → tuple-form runtime shape                     */
/* -------------------------------------------------------------------------- */

interface TrackJson {
  title: string;
  tagline: string;
  details?: string;
  subtopics?: string[];
}

const trackFromJson = (t: TrackJson): Track =>
  [t.title, t.tagline, t.details, t.subtopics] as Track;

/* -------------------------------------------------------------------------- */
/*  Build the conf object — same shape the app expects                        */
/* -------------------------------------------------------------------------- */

export const conf: ConferenceConfig = {
  // ── identity / contact ─────────────────────────────────────────────────────
  name: conferenceJson.name,
  short: conferenceJson.short,
  initials: conferenceJson.initials,
  year_suffix: conferenceJson.year_suffix,
  tagline: conferenceJson.tagline,
  edition: conferenceJson.edition,
  volume: conferenceJson.volume,
  issue: conferenceJson.issue,
  dateline: conferenceJson.dateline,
  discipline: conferenceJson.discipline,
  email: conferenceJson.email,
  phone: conferenceJson.phone,
  base: conferenceJson.base,
  hcaptcha_sitekey: conferenceJson.hcaptcha_sitekey,

  // ── hero / dates / location ────────────────────────────────────────────────
  theme_primary: conferenceJson.theme_primary,
  theme_pillars: conferenceJson.theme_pillars,
  theme_blurb: conferenceJson.theme_blurb,
  hero_title_lead: conferenceJson.hero_title_lead,
  hero_title_main: conferenceJson.hero_title_main,
  hero_title_year: conferenceJson.hero_title_year,
  hero_subtitle: conferenceJson.hero_subtitle,
  hero_cta: (conferenceJson as { hero_cta?: ConferenceConfig['hero_cta'] }).hero_cta || {
    register_label: 'Register Now',
    abstract_label: 'Submit Abstract',
    brochure_label: 'Download Brochure',
  },
  hero_card: (conferenceJson as { hero_card?: ConferenceConfig['hero_card'] }).hero_card || {
    status: 'Open for Registration',
    venue_label: 'Venue',
    venue_fallback: 'To be announced',
    countdown_label: 'Event Begins In',
  },
  hero_image: conferenceJson.hero_image,
  dates: conferenceJson.dates,
  dates_short: conferenceJson.dates_short,
  start_date_iso: conferenceJson.start_date_iso,
  city: conferenceJson.city,
  country: conferenceJson.country,
  venue: conferenceJson.venue,
  venue_tagline: conferenceJson.venue_tagline,
  venue_desc: conferenceJson.venue_desc,
  venue_image: conferenceJson.venue_image,

  // ── deadlines ──────────────────────────────────────────────────────────────
  abstract_deadline: conferenceJson.abstract_deadline,
  early_bird_deadline: conferenceJson.early_bird_deadline,

  // ── about block ────────────────────────────────────────────────────────────
  about_eyebrow: conferenceJson.about_eyebrow,
  about_heading: conferenceJson.about_heading,
  about_lead: conferenceJson.about_lead,
  about_body: conferenceJson.about_body,
  about_image: conferenceJson.about_image,

  // ── stats ──────────────────────────────────────────────────────────────────
  stats: conferenceJson.stats as Stat[],

  // ── tracks (JSON object form → tuple form) ────────────────────────────────
  tracks: tracksJson.tracks.map(trackFromJson),

  // ── marketing section ──────────────────────────────────────────────────────
  marquee_items: marketingJson.marquee_items as MarqueeItem[],
  why_eyebrow: marketingJson.why_eyebrow,
  why_heading: marketingJson.why_heading,
  why_intro: marketingJson.why_intro,
  why_attend: marketingJson.why_attend as WhyItem[],
  testimonials_heading: marketingJson.testimonials_heading,
  testimonials_intro: marketingJson.testimonials_intro,
  testimonials: marketingJson.testimonials as Testimonial[],
  key_dates: marketingJson.key_dates as KeyDate[],
  partners: marketingJson.partners,

  // ── speakers / committee ───────────────────────────────────────────────────
  featured_speakers: speakersJson.featured_speakers as Speaker[],
  ocm: speakersJson.ocm as OcmMember[],
  keynotes: speakersJson.keynotes as Keynote[],
  speakers_all: speakersJson.speakers_all as Speaker[],

  // ── social ─────────────────────────────────────────────────────────────────
  social: conferenceJson.social,
};

/* -------------------------------------------------------------------------- */
/*  Convenience exports for the new JSON-driven pages                         */
/*  Uses Addiction conference as default for backwards compatibility          */
/* -------------------------------------------------------------------------- */

export { default as committeeData } from '@/data/addiction/committee.json';
export { default as galleryData } from '@/data/addiction/gallery.json';
export { default as registrationData } from '@/data/addiction/registration.json';
export { default as commonData } from '@/data/addiction/common.json';
export { default as seoData } from '@/data/addiction/seo.json';
export { default as navigationData } from '@/data/addiction/navigation.json';

/* Navigation typing — used by Header.tsx + Footer.tsx */
export type NavLink = { label: string; href: string; cta?: boolean };
export type NavDropdown = { label: string; dropdown: NavLink[] };
export type HeaderNavItem = NavLink | NavDropdown;
export type FooterColumn = { heading: string; items: NavLink[] };
export const isDropdown = (i: HeaderNavItem): i is NavDropdown =>
  'dropdown' in i && Array.isArray(i.dropdown);
