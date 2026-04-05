import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Korantis — We Build Systems That Run Companies",
    template: "%s | Korantis",
  },
  description: "Korantis designs operational intelligence systems. Architecture, process control, and intelligence infrastructure for companies that scale.",
  keywords: ["Korantis", "Systems Architecture", "Operational Intelligence", "Process Control", "Systems Infrastructure"],
  authors: [{ name: "Korantis" }],
  creator: "Korantis",
  publisher: "Korantis",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Korantis — We Build Systems That Run Companies",
    description: "Your business is only as strong as your systems.",
    type: "website",
    siteName: "Korantis",
    locale: "en_US",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Korantis — Systems Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Korantis — We Build Systems That Run Companies",
    description: "Your business is only as strong as your systems.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B0B0D",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        {/* Micro-interactions — safe layer: z-index 0-2 only */}
        <link rel="stylesheet" href="/css/interactions.css" />
        {/* Atmosphere — grid, ambient light, intro styles */}
        <link rel="stylesheet" href="/css/atmosphere.css" />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        <script src="/js/interactions.js" defer />
        <script src="/js/space.js" defer />
      </body>
    </html>
  );
}
