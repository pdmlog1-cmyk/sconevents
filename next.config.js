/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
