# SCON Events Landing Pages - Project Memory

## Project Overview
- **Repository:** https://github.com/pdmlog1-cmyk/sconevents.git
- **Live URL:** https://sconevents.com
- **Framework:** Next.js 14 with dynamic routing
- **Hosting:** Vercel
- **Domain:** sconevents.com (DNS via Vercel nameservers)

## Vercel Nameservers
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

## hCaptcha Configuration
- **Sitekey:** `e3021954-d6b0-4d1a-b36c-c5e2d3062916`
- **Secret Key:** Stored in Vercel Environment Variables as `HCAPTCHA_SECRET_KEY`
- **Allowed Domains:** sconevents.com, www.sconevents.com
- **Dashboard:** https://dashboard.hcaptcha.com

## 10 Conference Landing Pages

| # | Slug | Short | Main Site URL | Landing Page URL |
|---|------|-------|---------------|------------------|
| 1 | Addiction-WCAB-2027-CzechRepublic | WCAB 2027 | https://addictionmedicine-conference.com | https://sconevents.com/Addiction-WCAB-2027-CzechRepublic |
| 2 | Biotechnology-GSBG-2027-Singapore | GSBG 2027 | https://biotech-meetings.com | https://sconevents.com/Biotechnology-GSBG-2027-Singapore |
| 3 | Cardiology-GCCM-2027-Spain | GCCM 2027 | https://cardiology-conference.com | https://sconevents.com/Cardiology-GCCM-2027-Spain |
| 4 | Food-GSFS-2027-Singapore | GSFS 2027 | https://foodtech-conference.com | https://sconevents.com/Food-GSFS-2027-Singapore |
| 5 | Gastroenterology-GCGD-2027-Singapore | GCGD 2027 | https://gastro-meetings.com | https://sconevents.com/Gastroenterology-GCGD-2027-Singapore |
| 6 | Neurology-GCNN-2027-CzechRepublic | GCNN 2027 | https://neuroscience-conference.com | https://sconevents.com/Neurology-GCNN-2027-CzechRepublic |
| 7 | Obesity-GSOD-2027-Singapore | GSOD 2027 | https://obesity-conferences.com | https://sconevents.com/Obesity-GSOD-2027-Singapore |
| 8 | Pharmaceutical-WCPD-2027-USA | WCPD 2027 | https://pharmaworldconference.com | https://sconevents.com/Pharmaceutical-WCPD-2027-USA |
| 9 | PhysicalMedicine-WSPR-2027-Singapore | WSPR 2027 | https://physicalmedicine-conference.com | https://sconevents.com/PhysicalMedicine-WSPR-2027-Singapore |
| 10 | Surgery-GCSA-2027-Spain | GCSA 2027 | https://surgery-meetings.com | https://sconevents.com/Surgery-GCSA-2027-Spain |

## Key Files Structure

```
sconevents-landing/
├── app/
│   └── [conference]/
│       ├── page.tsx              # Dynamic route page
│       ├── LandingClient.tsx     # Client component with theme injection
│       └── api/
│           └── brochure/
│               └── route.ts      # Brochure download API
├── components/
│   └── LandingLeadModal.tsx      # Brochure download modal
├── data/
│   └── [Conference-Slug]/
│       └── conference.json       # Conference-specific config
├── lib/
│   ├── conferences.ts            # Central conference config with themes
│   ├── getConfig.ts              # Config loader
│   └── forms.ts                  # Form utilities
└── .env.example                  # Environment variables template
```

## Conference Theme Colors (in lib/conferences.ts)
Each conference has unique theme colors:
- ink, paper, accent, muted
- inkSoft, accentSoft, paper2
- line, line2

## Environment Variables (Vercel)
```
HCAPTCHA_SECRET_KEY=ES_xxxxxxxx...
RESEND_API_KEY=re_xxxxxxxx (optional - for email)
FORM_FROM_EMAIL=noreply@... (optional)
FORM_TO_EMAIL=email@... (optional)
CMS_URL=https://api.sconcms.com (optional)
CID=10003 (optional)
```

## Git Configuration
```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

## Deployment Flow
1. Push to GitHub main branch
2. Vercel auto-deploys
3. Changes live in ~1-2 minutes

## API Routes
- Brochure download: `/{conference}/api/brochure` (POST)
  - Validates captcha
  - Sends to CMS
  - Returns download URL

## Important Fixes Applied
1. **API Path Fix:** Modal uses `/${slug}/api/brochure` for dynamic routes
2. **Theme Colors:** Each conference has unique CSS variables injected
3. **Inner Links:** Point to respective mainSiteUrl domains
4. **hCaptcha:** Updated sitekey for sconevents.com domain

## Troubleshooting
- **Captcha fails:** Check HCAPTCHA_SECRET_KEY in Vercel env vars
- **Wrong colors:** Check theme in lib/conferences.ts
- **API 404:** Ensure slug is passed to LandingLeadModal
- **Deploy fails:** Check Vercel build logs

---
Last Updated: May 2026
