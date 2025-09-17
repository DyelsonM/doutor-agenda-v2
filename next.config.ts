// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // já temos isso pra ignorar ESLint
  },
  typescript: {
    // 🚀 Ignora erros de TypeScript no build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
