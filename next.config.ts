const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alesha-unagile-sveltely.ngrok-free.dev",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "illo.thesyndicates.team",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "app.tixolve.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "admin.tixolve.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
