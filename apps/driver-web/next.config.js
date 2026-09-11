/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cruz/ui', '@cruz/types', '@cruz/config', '@cruz/utils', '@cruz/validation', '@cruz/api-client'],
};

module.exports = nextConfig;
