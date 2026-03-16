/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  async redirects() {
    return [
      {
        source: '/prijzen',
        destination: '/#prijzen',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
