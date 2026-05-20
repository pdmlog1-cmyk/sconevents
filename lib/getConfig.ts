/* =============================================================================
   Dynamic Conference Configuration Loader
   Loads conference data based on slug parameter
   ============================================================================= */

import { getConferenceMeta } from './conferences';
import type { ConferenceConfig, Track, Stat, WhyItem, Testimonial, KeyDate, MarqueeItem, Speaker, OcmMember, Keynote } from './config';

interface TrackJson {
  title: string;
  tagline: string;
  details?: string;
  subtopics?: string[];
}

const trackFromJson = (t: TrackJson): Track =>
  [t.title, t.tagline, t.details, t.subtopics] as Track;

export async function getConferenceConfig(slug: string): Promise<ConferenceConfig | null> {
  const meta = getConferenceMeta(slug);
  if (!meta) return null;

  try {
    // Dynamic imports for the conference data
    const conferenceJson = await import(`@/data/${meta.dataFolder}/conference.json`);
    const tracksJson = await import(`@/data/${meta.dataFolder}/tracks.json`);
    const speakersJson = await import(`@/data/${meta.dataFolder}/speakers.json`);
    const marketingJson = await import(`@/data/${meta.dataFolder}/marketing.json`);

    const conf = conferenceJson.default || conferenceJson;
    const tracks = tracksJson.default || tracksJson;
    const speakers = speakersJson.default || speakersJson;
    const marketing = marketingJson.default || marketingJson;

    return {
      // Identity / contact
      name: conf.name,
      short: conf.short,
      initials: conf.initials,
      year_suffix: conf.year_suffix,
      tagline: conf.tagline,
      edition: conf.edition,
      volume: conf.volume,
      issue: conf.issue,
      dateline: conf.dateline,
      discipline: conf.discipline,
      email: conf.email,
      phone: conf.phone,
      base: conf.base,
      hcaptcha_sitekey: conf.hcaptcha_sitekey,

      // Hero / dates / location
      theme_primary: conf.theme_primary,
      theme_pillars: conf.theme_pillars,
      theme_blurb: conf.theme_blurb,
      hero_title_lead: conf.hero_title_lead,
      hero_title_main: conf.hero_title_main,
      hero_title_year: conf.hero_title_year,
      hero_subtitle: conf.hero_subtitle,
      hero_cta: conf.hero_cta || {
        register_label: 'Register Now',
        abstract_label: 'Submit Abstract',
        brochure_label: 'Download Brochure',
      },
      hero_card: conf.hero_card || {
        status: 'Open for Registration',
        venue_label: 'Venue',
        venue_fallback: 'To be announced',
        countdown_label: 'Event Begins In',
      },
      hero_image: conf.hero_image,
      dates: conf.dates,
      dates_short: conf.dates_short,
      start_date_iso: conf.start_date_iso,
      city: conf.city,
      country: conf.country,
      venue: conf.venue,
      venue_tagline: conf.venue_tagline,
      venue_desc: conf.venue_desc,
      venue_image: conf.venue_image,

      // Deadlines
      abstract_deadline: conf.abstract_deadline,
      early_bird_deadline: conf.early_bird_deadline,

      // About block
      about_eyebrow: conf.about_eyebrow,
      about_heading: conf.about_heading,
      about_lead: conf.about_lead,
      about_body: conf.about_body,
      about_image: conf.about_image,

      // Stats
      stats: conf.stats as Stat[],

      // Tracks
      tracks: tracks.tracks.map(trackFromJson),

      // Marketing
      marquee_items: marketing.marquee_items as MarqueeItem[],
      why_eyebrow: marketing.why_eyebrow,
      why_heading: marketing.why_heading,
      why_intro: marketing.why_intro,
      why_attend: marketing.why_attend as WhyItem[],
      testimonials_heading: marketing.testimonials_heading,
      testimonials_intro: marketing.testimonials_intro,
      testimonials: marketing.testimonials as Testimonial[],
      key_dates: marketing.key_dates as KeyDate[],
      partners: marketing.partners,

      // Speakers / committee
      featured_speakers: speakers.featured_speakers as Speaker[],
      ocm: speakers.ocm as OcmMember[],
      keynotes: speakers.keynotes as Keynote[],
      speakers_all: speakers.speakers_all as Speaker[],

      // Social
      social: conf.social,
    };
  } catch (error) {
    console.error(`Failed to load conference data for ${slug}:`, error);
    return null;
  }
}
