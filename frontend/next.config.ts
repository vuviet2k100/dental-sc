import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Khai báo biến môi trường để client-side có thể truy cập
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;