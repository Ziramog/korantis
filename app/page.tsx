import type { Metadata } from "next";
import HomePage from "./home-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Home - Korantis Web",
  description: "Welcome to Korantis Web - a modern, fast, and responsive web application built with Next.js, TypeScript, and Material Design. Explore features, learn about us, and get in touch.",
  openGraph: {
    title: "Korantis Web - Home",
    description: "Welcome to Korantis Web - a modern, fast, and responsive web application built with Next.js, TypeScript, and Material Design.",
    type: "website",
    url: siteUrl,
    siteName: "Korantis Web",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korantis Web - Home",
    description: "Welcome to Korantis Web - a modern, fast, and responsive web application.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function Page() {
  return <HomePage />;
}
