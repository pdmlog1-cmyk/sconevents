/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This machine is short on RAM and the page file cannot grow, so the build
  // is kept to a single worker rather than one per core. Slower, but it stops
  // the worker being killed mid-compile.
  experimental: { cpus: 1, workerThreads: false },
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cardiology-conference.com' },
      { protocol: 'https', hostname: 'addictionconference.com' },
      { protocol: 'https', hostname: 'biotechnologyconference.com' },
      { protocol: 'https', hostname: 'foodconference.com' },
      { protocol: 'https', hostname: 'gastroconference.com' },
      { protocol: 'https', hostname: 'neuroscienceconference.com' },
      { protocol: 'https', hostname: 'obesity-conference.com' },
      { protocol: 'https', hostname: 'pharmaconference.com' },
      { protocol: 'https', hostname: 'physicalmedicineconference.com' },
      { protocol: 'https', hostname: 'surgery-conference.com' }
    ]
  }
};
module.exports = nextConfig;
