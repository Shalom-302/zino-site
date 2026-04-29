/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverBodySizeLimit: '500mb',
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'slelguoygbfzlpylpxfs.supabase.co' },
      { protocol: 'https', hostname: 'actcisklxhxzzgvygdfb.supabase.co' },
      // Self-hosted Supabase — production HTTPS domain
      { protocol: 'https', hostname: 'api-supabase.zfitspa.com' },
      // Self-hosted Supabase (HTTP via Traefik — legacy / local)
      { protocol: 'http',  hostname: 'zfitspa-pre0225supabase-00fc42-187-124-218-132.traefik.me' },
      { protocol: 'https', hostname: 'zfitspa-pre0225supabase-00fc42-187-124-218-132.traefik.me' },
    ],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
