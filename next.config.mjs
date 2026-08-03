import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        // Ensure Next/Turbopack watches only this project (prevents accidental home-dir root)
        root: __dirname,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'mixx.co.tz',
            },
            {
                protocol: 'https',
                hostname: 'www.mixx.co.tz',
            },
            {
                protocol: 'https',
                hostname: 'images.crunchbase.com',
            },
            {
                protocol: 'https',
                hostname: 'logowik.com',
            },
            {
                protocol: 'https',
                hostname: 'wp.logos-download.com',
            },
            {
                protocol: 'https',
                hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
            },
        ],
    },
};

export default nextConfig;
