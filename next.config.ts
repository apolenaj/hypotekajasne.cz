import type { NextConfig } from "next";
import {
  CSP_REPORT_ONLY_VALUE,
  SECURITY_HEADERS,
} from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/prověrka-nemovitosti",
        destination: "/proverka-nemovitosti",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...SECURITY_HEADERS.map((h) => ({
            key: h.key,
            value: h.value,
          })),
          {
            key: "Content-Security-Policy-Report-Only",
            value: CSP_REPORT_ONLY_VALUE,
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
