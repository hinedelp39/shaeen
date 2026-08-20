/** @type {import('next').NextConfig} */
const nextConfig = {
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
                hostname: 'play-lh.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
            },
        ],
    },
};

export default nextConfig;
