/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    serverComponentsExternalPackages: []
  },
  // Increase static generation timeout
  staticPageGenerationTimeout: 300,
  // Configure output for Railway
  output: 'standalone'
};
export default nextConfig;