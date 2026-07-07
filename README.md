# SCON Events Landing Pages

10 conference landing pages deployed under `sconevents.com`.

## Structure

```
sconevents-landing/
├── conferences/           # Individual Next.js apps
│   ├── Addiction-WCAB-2027-CzechRepublic/
│   ├── Biotechnology-GSBG-2027-USA/
│   ├── Cardiology-GCCM-2027-Spain/
│   └── ... (10 total)
├── out/                   # Combined static output (after build)
├── build-all.js           # Build script
└── package.json
```

## URLs

After deployment:
- `sconevents.com/Addiction-WCAB-2027-CzechRepublic/`
- `sconevents.com/Biotechnology-GSBG-2027-USA/`
- `sconevents.com/Cardiology-GCCM-2027-Spain/`
- etc.

## Build & Deploy

### Option 1: Manual Build (Local)

```bash
# Install dependencies for build script
npm install

# Build all conferences (generates /out folder)
node build-all.js

# Deploy out/ folder to Vercel
cd out
vercel --prod
```

### Option 2: Vercel Auto-Deploy (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Set build settings:
   - Build Command: `node build-all.js`
   - Output Directory: `out`
   - Install Command: `npm install`

## Environment Variables (per conference)

Set in Vercel dashboard under project settings:

| Variable | Description |
|----------|-------------|
| `HCAPTCHA_SECRET_KEY` | hCaptcha server validation |
| `RESEND_API_KEY` | Email delivery |
| `FORM_FROM_EMAIL` | Sender email |
| `FORM_TO_EMAIL` | Recipient email |

## Local Development

```bash
cd conferences/Addiction-WCAB-2027-CzechRepublic
npm install
npm run dev
# Open http://localhost:3000
```
