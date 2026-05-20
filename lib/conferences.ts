/**
 * Conference configurations and mappings
 */

export interface ConferenceMeta {
  slug: string;
  name: string;
  short: string;
  mainSiteUrl: string;
  dataFolder: string;
}

export const CONFERENCES: ConferenceMeta[] = [
  {
    slug: 'Addiction-WCAM-2027-USA',
    name: 'World Congress on Addiction Medicine & Behavioral Health',
    short: 'WCAM 2027',
    mainSiteUrl: 'https://addictionmedicine-conference.com',
    dataFolder: 'Addiction-WCAM-2027-USA',
  },
  {
    slug: 'Biotechnology-GSBG-2027-USA',
    name: 'Global Summit on Biotechnology & Genetic Engineering',
    short: 'GSBG 2027',
    mainSiteUrl: 'https://biotech-meetings.com',
    dataFolder: 'Biotechnology-GSBG-2027-USA',
  },
  {
    slug: 'Cardiology-GCCM-2027-USA',
    name: 'Global Congress on Cardiology & Cardiovascular Medicine',
    short: 'GCCM 2027',
    mainSiteUrl: 'https://cardiology-conference.com',
    dataFolder: 'Cardiology-GCCM-2027-USA',
  },
  {
    slug: 'Food-GSFS-2027-USA',
    name: 'Global Summit on Food Science & Technology',
    short: 'GSFS 2027',
    mainSiteUrl: 'https://foodtech-conference.com',
    dataFolder: 'Food-GSFS-2027-USA',
  },
  {
    slug: 'Gastroenterology-GCGD-2027-USA',
    name: 'Global Congress on Gastroenterology & Digestive Disorders',
    short: 'GCGD 2027',
    mainSiteUrl: 'https://gastro-meetings.com',
    dataFolder: 'Gastroenterology-GCGD-2027-USA',
  },
  {
    slug: 'Neurology-GCNN-2027-USA',
    name: 'Global Congress on Neurology & Neuroscience',
    short: 'GCNN 2027',
    mainSiteUrl: 'https://neuroscience-conference.com',
    dataFolder: 'Neurology-GCNN-2027-USA',
  },
  {
    slug: 'Obesity-GSOD-2027-USA',
    name: 'Global Summit on Obesity & Diabetes',
    short: 'GSOD 2027',
    mainSiteUrl: 'https://obesity-conferences.com',
    dataFolder: 'Obesity-GSOD-2027-USA',
  },
  {
    slug: 'Pharmaceutical-WCPD-2027-USA',
    name: 'World Congress on Pharmaceutical Development',
    short: 'WCPD 2027',
    mainSiteUrl: 'https://pharmaworldconference.com',
    dataFolder: 'Pharmaceutical-WCPD-2027-USA',
  },
  {
    slug: 'PhysicalMedicine-GCPR-2027-USA',
    name: 'Global Congress on Physical Medicine & Rehabilitation',
    short: 'GCPR 2027',
    mainSiteUrl: 'https://physicalmedicine-conference.com',
    dataFolder: 'PhysicalMedicine-GCPR-2027-USA',
  },
  {
    slug: 'Surgery-GCSA-2027-USA',
    name: 'Global Congress on Surgery & Anesthesia',
    short: 'GCSA 2027',
    mainSiteUrl: 'https://surgery-meetings.com',
    dataFolder: 'Surgery-GCSA-2027-USA',
  },
];

export function getConferenceMeta(slug: string): ConferenceMeta | undefined {
  return CONFERENCES.find(c => c.slug === slug);
}

export function getAllConferenceSlugs(): string[] {
  return CONFERENCES.map(c => c.slug);
}
