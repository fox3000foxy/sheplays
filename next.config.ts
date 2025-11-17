import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://sheplays.wtf",
    NEXT_PUBLIC_BOT_API_URL: process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3010",
    NEXT_PUBLIC_DASHBOARD_API_KEY: process.env.NEXT_PUBLIC_DASHBOARD_API_KEY || "",
  },
};

export default nextConfig;
