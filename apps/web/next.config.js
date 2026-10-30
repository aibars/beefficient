/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@beefficient/domain'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
