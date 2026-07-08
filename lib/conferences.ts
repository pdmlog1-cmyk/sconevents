/**
 * Conference configurations and mappings
 */

export interface ConferenceTheme {
  ink: string;
  paper: string;
  accent: string;
  muted: string;
  inkSoft: string;
  accentSoft: string;
  paper2: string;
  line: string;
  line2: string;
}

export interface ConferenceMeta {
  slug: string;
  name: string;
  short: string;
  mainSiteUrl: string;
  dataFolder: string;
  gtagId: string;
  theme: ConferenceTheme;
}

export const CONFERENCES: ConferenceMeta[] = [
  {
    slug: 'Addiction-WCAB-2027-CzechRepublic',
    name: 'World Congress on Addiction Medicine & Behavioral Health',
    short: 'WCAB 2027',
    mainSiteUrl: 'https://addictionmedicine-conference.com',
    dataFolder: 'Addiction-WCAB-2027-CzechRepublic',
    gtagId: 'G-72FTRCQRZ4',
    theme: {
      ink: '#1f0606',
      paper: '#ffffff',
      accent: '#7f1d1d',
      muted: '#5a3a3a',
      inkSoft: '#450a0a',
      accentSoft: 'rgba(127,29,29,0.12)',
      paper2: '#fef2f2',
      line: '#fee2e2',
      line2: '#fecaca',
    },
  },
  {
    slug: 'Biotechnology-GSBG-2027-Singapore',
    name: 'Global Summit on Biotechnology & Genetic Engineering',
    short: 'GSBG 2027',
    mainSiteUrl: 'https://biotech-meetings.com',
    dataFolder: 'Biotechnology-GSBG-2027-Singapore',
    gtagId: 'G-L0G0SDS5DJ',
    theme: {
      ink: '#052e1c',
      paper: '#ffffff',
      accent: '#059669',
      muted: '#3a5a4a',
      inkSoft: '#064e3b',
      accentSoft: 'rgba(5,150,105,0.12)',
      paper2: '#ecfdf5',
      line: '#d1fae5',
      line2: '#a7f3d0',
    },
  },
  {
    slug: 'Cardiology-GCCM-2027-Spain',
    name: 'Global Congress on Cardiology & Cardiovascular Medicine',
    short: 'GCCM 2027',
    mainSiteUrl: 'https://cardiology-conference.com',
    dataFolder: 'Cardiology-GCCM-2027-Spain',
    gtagId: 'G-CWZPWGYS63',
    theme: {
      ink: '#3a1419',
      paper: '#ffffff',
      accent: '#e8536e',
      muted: '#5a6578',
      inkSoft: '#5a1f25',
      accentSoft: 'rgba(232,83,110,0.12)',
      paper2: '#fff1f2',
      line: '#ffe4e6',
      line2: '#fecdd3',
    },
  },
  {
    slug: 'Food-GSFS-2027-Singapore',
    name: 'Global Summit on Food Science & Technology',
    short: 'GSFS 2027',
    mainSiteUrl: 'https://foodtech-conference.com',
    dataFolder: 'Food-GSFS-2027-Singapore',
    gtagId: 'G-03VL0LQE98',
    theme: {
      ink: '#2c1f06',
      paper: '#ffffff',
      accent: '#ca8a04',
      muted: '#5a4a3a',
      inkSoft: '#422006',
      accentSoft: 'rgba(202,138,4,0.12)',
      paper2: '#fefce8',
      line: '#fef9c3',
      line2: '#fef08a',
    },
  },
  {
    slug: 'Gastroenterology-GCGD-2027-Singapore',
    name: 'Global Congress on Gastroenterology & Digestive Disorders',
    short: 'GCGD 2027',
    mainSiteUrl: 'https://gastro-meetings.com',
    dataFolder: 'Gastroenterology-GCGD-2027-Singapore',
    gtagId: 'G-9Q9VNP5F3P',
    theme: {
      ink: '#3a0a3d',
      paper: '#ffffff',
      accent: '#86198f',
      muted: '#5a4a5a',
      inkSoft: '#4a044e',
      accentSoft: 'rgba(134,25,143,0.12)',
      paper2: '#fdf4ff',
      line: '#fae8ff',
      line2: '#f5d0fe',
    },
  },
  {
    slug: 'Neurology-GCNN-2027-CzechRepublic',
    name: 'Global Congress on Neurology & Neuroscience',
    short: 'GCNN 2027',
    mainSiteUrl: 'https://neuroscience-conference.com',
    dataFolder: 'Neurology-GCNN-2027-CzechRepublic',
    gtagId: 'G-H21Z28P7R4',
    theme: {
      ink: '#3b0764',
      paper: '#ffffff',
      accent: '#7e22ce',
      muted: '#5a4a6a',
      inkSoft: '#4c1d95',
      accentSoft: 'rgba(126,34,206,0.12)',
      paper2: '#faf5ff',
      line: '#f3e8ff',
      line2: '#e9d5ff',
    },
  },
  {
    slug: 'Obesity-GSOD-2027-Singapore',
    name: 'Global Summit on Obesity & Diabetes',
    short: 'GSOD 2027',
    mainSiteUrl: 'https://obesity-conferences.com',
    dataFolder: 'Obesity-GSOD-2027-Singapore',
    gtagId: 'G-Q79C9D7F7Y',
    theme: {
      ink: '#001833',
      paper: '#ffffff',
      accent: '#005EB8',
      muted: '#4a5a6a',
      inkSoft: '#0c4a6e',
      accentSoft: 'rgba(0,94,184,0.12)',
      paper2: '#f0f9ff',
      line: '#e0f2fe',
      line2: '#bae6fd',
    },
  },
  {
    slug: 'Pharmaceutical-WCPD-2027-Singapore',
    name: 'World Congress on Pharmaceutical Development',
    short: 'WCPD 2027',
    mainSiteUrl: 'https://pharmaworldconference.com',
    dataFolder: 'Pharmaceutical-WCPD-2027-Singapore',
    gtagId: 'G-8814RF0TYP',
    theme: {
      ink: '#073b3a',
      paper: '#ffffff',
      accent: '#0a9396',
      muted: '#4a5a5a',
      inkSoft: '#134e4a',
      accentSoft: 'rgba(10,147,150,0.12)',
      paper2: '#f0fdfa',
      line: '#ccfbf1',
      line2: '#99f6e4',
    },
  },
  {
    slug: 'PhysicalMedicine-WSPR-2027-Singapore',
    name: 'World Summit on Physical Medicine & Rehabilitation',
    short: 'WSPR 2027',
    mainSiteUrl: 'https://physicalmedicine-conference.com',
    dataFolder: 'PhysicalMedicine-WSPR-2027-Singapore',
    gtagId: 'G-JJWRK17881',
    theme: {
      ink: '#3a1006',
      paper: '#ffffff',
      accent: '#ea580c',
      muted: '#5a4a3a',
      inkSoft: '#7c2d12',
      accentSoft: 'rgba(234,88,12,0.12)',
      paper2: '#fff7ed',
      line: '#ffedd5',
      line2: '#fed7aa',
    },
  },
  {
    slug: 'Surgery-GCSA-2027-Spain',
    name: 'Global Congress on Surgery & Anesthesia',
    short: 'GCSA 2027',
    mainSiteUrl: 'https://surgery-meetings.com',
    dataFolder: 'Surgery-GCSA-2027-Spain',
    gtagId: 'G-KVQS21YME0',
    theme: {
      ink: '#1e3a8a',
      paper: '#ffffff',
      accent: '#2563eb',
      muted: '#4a5a7a',
      inkSoft: '#1e40af',
      accentSoft: 'rgba(37,99,235,0.12)',
      paper2: '#eff6ff',
      line: '#dbeafe',
      line2: '#bfdbfe',
    },
  },
];

export function getConferenceMeta(slug: string): ConferenceMeta | undefined {
  return CONFERENCES.find(c => c.slug === slug);
}

export function getAllConferenceSlugs(): string[] {
  return CONFERENCES.map(c => c.slug);
}
