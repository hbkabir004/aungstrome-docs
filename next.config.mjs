import withPWA from "next-pwa"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    // Configure headers for Google OAuth popup compatibility
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
    ]
  },
}

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  cacheOnFrontEndNav: true,
  reloadOnOnline: false, // Don't auto-reload, let our app handle it gracefully
  runtimeCaching: [
    // Google APIs - Network only (they require authentication)
    {
      urlPattern: /^https:\/\/apis\.google\.com\/.*/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "google-apis",
      },
    },
    {
      urlPattern: /^https:\/\/accounts\.google\.com\/.*/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "google-accounts",
      },
    },
    {
      urlPattern: /^https:\/\/www\.googleapis\.com\/.*/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "google-drive-api",
      },
    },
    // Google Fonts - Cache first for performance
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    // Font files
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-font-assets",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // Images - Cache first
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-image-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // JS files - Stale while revalidate
    {
      urlPattern: /\.(?:js)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-js-assets",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // CSS files - Stale while revalidate
    {
      urlPattern: /\.(?:css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-style-assets",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    // Next.js pages and data - Cache first, then network
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    // API routes and dynamic content - Network first
    {
      urlPattern: /^https?:\/\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "others",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
})(nextConfig)
