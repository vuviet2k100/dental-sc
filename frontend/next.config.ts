import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Giữ lại cấu hình env của bạn
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;