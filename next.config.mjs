import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enables Cache Components (opt-in caching via `use cache` directive)
  cacheComponents: true,
  // Turbopack is the default bundler in Next.js 16; explicit config for future customization
  turbopack: {
    // Explicitly set root to avoid confusion with parent directory's lockfile
    root: __dirname,
  },
};

export default nextConfig;
