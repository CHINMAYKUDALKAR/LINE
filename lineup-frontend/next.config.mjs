/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    allowedDevOrigins: ["0.0.0.0:3000", "192.168.29.236:3000", "localhost:3000"],
  },
};

export default nextConfig;
