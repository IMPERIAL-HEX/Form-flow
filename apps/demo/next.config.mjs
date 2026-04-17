import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@formflow/core': path.resolve(process.cwd(), '../../packages/core/src/index.ts'),
      '@formflow/react': path.resolve(process.cwd(), '../../packages/react/src/index.ts'),
    };

    return config;
  },
};

export default nextConfig;
