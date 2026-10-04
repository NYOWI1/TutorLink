import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  output: 'standalone',
  devIndicators: false,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};
export default config;
