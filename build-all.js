/**
 * Build script for SCON Events Landing Pages
 *
 * This script:
 * 1. Builds each conference's Next.js app with static export
 * 2. Combines all outputs into a single 'out' folder
 * 3. Creates vercel.json for deployment
 *
 * Usage: node build-all.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFERENCES_DIR = path.join(__dirname, 'conferences');
const OUT_DIR = path.join(__dirname, 'out');

// Get all conference folders
const conferences = fs.readdirSync(CONFERENCES_DIR)
  .filter(f => f.endsWith('-USA') && fs.statSync(path.join(CONFERENCES_DIR, f)).isDirectory());

console.log(`Found ${conferences.length} conferences to build:\n`);
conferences.forEach(c => console.log(`  - ${c}`));
console.log('');

// Clean output directory
if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true });
}
fs.mkdirSync(OUT_DIR);

// Build each conference
for (const conf of conferences) {
  const confDir = path.join(CONFERENCES_DIR, conf);
  const confOutDir = path.join(OUT_DIR, conf);

  console.log(`\n========================================`);
  console.log(`Building: ${conf}`);
  console.log(`========================================\n`);

  // Update next.config.js to add basePath and output: 'export'
  const nextConfigPath = path.join(confDir, 'next.config.js');
  const originalConfig = fs.readFileSync(nextConfigPath, 'utf8');

  const newConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/${conf}',
  assetPrefix: '/${conf}',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cardiology-conference.com' }
    ]
  }
};
module.exports = nextConfig;
`;

  fs.writeFileSync(nextConfigPath, newConfig);

  try {
    // Install dependencies if needed
    if (!fs.existsSync(path.join(confDir, 'node_modules'))) {
      console.log('Installing dependencies...');
      execSync('npm install', { cwd: confDir, stdio: 'inherit' });
    }

    // Build
    console.log('Building...');
    execSync('npm run build', { cwd: confDir, stdio: 'inherit' });

    // Copy output
    const buildOut = path.join(confDir, 'out');
    if (fs.existsSync(buildOut)) {
      fs.cpSync(buildOut, confOutDir, { recursive: true });
      console.log(`✓ Copied to out/${conf}`);
    }
  } catch (error) {
    console.error(`✗ Build failed for ${conf}:`, error.message);
  }

  // Restore original config
  fs.writeFileSync(nextConfigPath, originalConfig);
}

// Create index.html that lists all conferences
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SCON Events - Landing Pages</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; padding: 48px 24px; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { font-size: 2.5rem; margin-bottom: 8px; color: #fff; }
    .subtitle { color: #94a3b8; margin-bottom: 48px; }
    .grid { display: grid; gap: 16px; }
    a { display: block; padding: 20px 24px; background: #1e293b; border-radius: 12px; color: #fff; text-decoration: none; transition: all 0.2s; border: 1px solid #334155; }
    a:hover { background: #334155; transform: translateY(-2px); }
    .conf-name { font-size: 1.1rem; font-weight: 600; }
    .conf-code { font-size: 0.85rem; color: #64748b; margin-top: 4px; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <h1>SCON Events</h1>
    <p class="subtitle">Select a conference landing page:</p>
    <div class="grid">
${conferences.map(c => {
  const name = c.split('-')[0];
  return `      <a href="/${c}/">
        <div class="conf-name">${name} Conference</div>
        <div class="conf-code">${c}</div>
      </a>`;
}).join('\n')}
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHtml);

// Create vercel.json
const vercelJson = {
  "cleanUrls": true,
  "trailingSlash": true
};
fs.writeFileSync(path.join(OUT_DIR, 'vercel.json'), JSON.stringify(vercelJson, null, 2));

console.log(`\n========================================`);
console.log(`Build complete!`);
console.log(`Output: ${OUT_DIR}`);
console.log(`========================================\n`);
