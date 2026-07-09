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
| 1 | addiction | WCAB 2027 | https://addictionmedicine-conference.com | https://sconevents.com/addiction |
| 2 | biotechnology | GSBG 2027 | https://biotech-meetings.com | https://sconevents.com/biotechnology |
| 3 | cardiology | GCCM 2027 | https://cardiology-conference.com | https://sconevents.com/cardiology |
| 4 | food | GSFS 2027 | https://foodtech-conference.com | https://sconevents.com/food |
| 5 | gastroenterology | GCGD 2027 | https://gastro-meetings.com | https://sconevents.com/gastroenterology |
| 6 | neurology | GCNN 2027 | https://neuroscience-conference.com | https://sconevents.com/neurology |
| 7 | obesity | GSOD 2027 | https://obesity-conferences.com | https://sconevents.com/obesity |
| 8 | pharmaceutical | WCPD 2027 | https://pharmaworldconference.com | https://sconevents.com/pharmaceutical |
| 9 | physicalmedicine | WSPR 2027 | https://physicalmedicine-conference.com | https://sconevents.com/physicalmedicine |
| 10 | surgery | GCSA 2027 | https://surgery-meetings.com | https://sconevents.com/surgery |

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
